import { useState } from 'react';
import { GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { useLaunches, StatusFilter, Launch } from '../../hooks/useLaunches';
import { useDebounce } from '../../hooks/useDebounce';

const VALID_SORT_FIELDS = new Set(['flight_number', 'name', 'date_utc', 'success']);
const VALID_SORT_DIRS = new Set(['asc', 'desc']);
const VALID_STATUS_FILTERS = new Set<StatusFilter>(['all', 'success', 'failed', 'unknown']);

function readStateFromUrl(): {
  pagination: GridPaginationModel;
  search: string;
  sortModel: GridSortModel;
  statusFilter: StatusFilter;
} {
  const params = new URLSearchParams(globalThis.location.search);
  const page = Number.parseInt(params.get('page') ?? '0', 10);
  const pageSize = Number.parseInt(params.get('pageSize') ?? '10', 10);
  const sortField = params.get('sortField');
  const sortDir = params.get('sortDir');
  const statusParam = params.get('status');
  const validPageSizes = [5, 10, 25, 50];

  return {
    pagination: {
      page: Number.isNaN(page) || page < 0 ? 0 : page,
      pageSize: validPageSizes.includes(pageSize) ? pageSize : 10,
    },
    search: params.get('search') ?? '',
    sortModel:
      sortField && VALID_SORT_FIELDS.has(sortField) && sortDir && VALID_SORT_DIRS.has(sortDir)
        ? [{ field: sortField, sort: sortDir as 'asc' | 'desc' }]
        : [],
    statusFilter: VALID_STATUS_FILTERS.has(statusParam as StatusFilter)
      ? (statusParam as StatusFilter)
      : 'all',
  };
}

function writeStateToUrl(
  model: GridPaginationModel,
  search: string,
  sortModel: GridSortModel,
  statusFilter: StatusFilter,
) {
  const params = new URLSearchParams(globalThis.location.search);
  params.set('page', String(model.page));
  params.set('pageSize', String(model.pageSize));
  if (search) { params.set('search', search); } else { params.delete('search'); }
  if (sortModel[0]?.field) {
    params.set('sortField', sortModel[0].field);
    params.set('sortDir', sortModel[0].sort ?? 'desc');
  } else {
    params.delete('sortField');
    params.delete('sortDir');
  }
  if (statusFilter === 'all') { params.delete('status'); } else { params.set('status', statusFilter); }
  globalThis.history.replaceState(null, '', `?${params.toString()}`);
}

export function useLaunchTable() {
  const initialState = readStateFromUrl();

  const [search, setSearch] = useState(initialState.search);
  const debouncedSearch = useDebounce(search, 500);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(initialState.pagination);

  const [sortModel, setSortModel] = useState<GridSortModel>(initialState.sortModel);
  const sortField = sortModel[0]?.field ?? null;
  const sortDir = sortModel[0]?.sort ?? 'desc';

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialState.statusFilter);

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);

  const { launches, totalDocs, loading, error } = useLaunches({
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    search: debouncedSearch,
    sortField,
    sortDir,
    statusFilter,
  });

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    writeStateToUrl(model, search, sortModel, statusFilter);
  };

  const handleSortChange = (model: GridSortModel) => {
    setSortModel(model);
    writeStateToUrl(paginationModel, search, model, statusFilter);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const resetModel = { ...paginationModel, page: 0 };
    setPaginationModel(resetModel);
    writeStateToUrl(resetModel, value, sortModel, statusFilter);
  };

  const handleStatusFilterChange = (_: React.MouseEvent, value: StatusFilter | null) => {
    const next = value ?? statusFilter;
    setStatusFilter(next);
    const resetModel = { ...paginationModel, page: 0 };
    setPaginationModel(resetModel);
    writeStateToUrl(resetModel, search, sortModel, next);
  };

  const selectedIds =
    selectionModel.type === 'include'
      ? selectionModel.ids
      : new Set(launches.map((r) => r.id).filter((id) => !selectionModel.ids.has(id)));

  const handleCopy = (formatRow: (row: (typeof launches)[0]) => string) => {
    const selectedRows = launches.filter((row) => selectedIds.has(row.id));
    const text = selectedRows.map(formatRow).join('\n');
    navigator.clipboard.writeText(text).then(() => setSnackbarOpen(true));
  };

  return {
    launches,
    totalDocs,
    loading,
    error,
    search,
    handleSearchChange,
    paginationModel,
    handlePaginationChange,
    sortModel,
    handleSortChange,
    statusFilter,
    handleStatusFilterChange,
    selectionModel,
    setSelectionModel,
    selectedIds,
    handleCopy,
    snackbarOpen,
    setSnackbarOpen,
    selectedLaunch,
    setSelectedLaunch,
  };
}
