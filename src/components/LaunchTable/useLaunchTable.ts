import { useState } from 'react';
import { GridColumnVisibilityModel, GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { useLaunches, StatusFilter, Launch } from '../../hooks/useLaunches';
import { useDebounce } from '../../hooks/useDebounce';

const VALID_SORT_FIELDS = new Set(['flight_number', 'name', 'date_utc', 'success']);
const VALID_SORT_DIRS = new Set(['asc', 'desc']);
const VALID_STATUS_FILTERS = new Set<StatusFilter>(['all', 'success', 'failed', 'unknown']);
const COLUMN_FIELDS = new Set(['flight_number', 'name', 'date_utc', 'success']);

function readStateFromUrl(): {
  pagination: GridPaginationModel;
  search: string;
  sortModel: GridSortModel;
  statusFilter: StatusFilter;
  dateFrom: string | null;
  dateTo: string | null;
  columnVisibility: GridColumnVisibilityModel;
} {
  const params = new URLSearchParams(globalThis.location.search);
  const page = Number.parseInt(params.get('page') ?? '0', 10);
  const pageSize = Number.parseInt(params.get('pageSize') ?? '10', 10);
  const sortField = params.get('sortField');
  const sortDir = params.get('sortDir');
  const statusParam = params.get('status');
  const validPageSizes = [5, 10, 25, 50];

  const columnVisibility: GridColumnVisibilityModel = {};
  const hiddenCols = params.get('hiddenCols');
  if (hiddenCols) {
    hiddenCols.split(',').forEach((col) => {
      if (COLUMN_FIELDS.has(col)) columnVisibility[col] = false;
    });
  }

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
    dateFrom: params.get('dateFrom'),
    dateTo: params.get('dateTo'),
    columnVisibility,
  };
}

function writeStateToUrl(
  model: GridPaginationModel,
  search: string,
  sortModel: GridSortModel,
  statusFilter: StatusFilter,
  dateFrom: string | null,
  dateTo: string | null,
  columnVisibility: GridColumnVisibilityModel,
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
  if (dateFrom) { params.set('dateFrom', dateFrom); } else { params.delete('dateFrom'); }
  if (dateTo) { params.set('dateTo', dateTo); } else { params.delete('dateTo'); }
  const hiddenCols = Object.entries(columnVisibility)
    .filter(([, visible]) => visible === false)
    .map(([col]) => col)
    .join(',');
  if (hiddenCols) { params.set('hiddenCols', hiddenCols); } else { params.delete('hiddenCols'); }
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

  const [dateFrom, setDateFrom] = useState<string | null>(initialState.dateFrom);
  const [dateTo, setDateTo] = useState<string | null>(initialState.dateTo);

  const [columnVisibility, setColumnVisibility] = useState<GridColumnVisibilityModel>(initialState.columnVisibility);

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
    dateFrom,
    dateTo,
  });

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    writeStateToUrl(model, search, sortModel, statusFilter, dateFrom, dateTo, columnVisibility);
  };

  const handleSortChange = (model: GridSortModel) => {
    setSortModel(model);
    writeStateToUrl(paginationModel, search, model, statusFilter, dateFrom, dateTo, columnVisibility);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const resetModel = { ...paginationModel, page: 0 };
    setPaginationModel(resetModel);
    writeStateToUrl(resetModel, value, sortModel, statusFilter, dateFrom, dateTo, columnVisibility);
  };

  const handleDateFromChange = (value: string = '') => {
    const next = value || null;
    setDateFrom(next);
    const resetModel = { ...paginationModel, page: 0 };
    setPaginationModel(resetModel);
    writeStateToUrl(resetModel, search, sortModel, statusFilter, next, dateTo, columnVisibility);
  };

  const handleDateToChange = (value: string = '') => {
    const next = value || null;
    setDateTo(next);
    const resetModel = { ...paginationModel, page: 0 };
    setPaginationModel(resetModel);
    writeStateToUrl(resetModel, search, sortModel, statusFilter, dateFrom, next, columnVisibility);
  };

  const handleStatusFilterChange = (_: React.MouseEvent, value: StatusFilter | null) => {
    const next = value ?? statusFilter;
    setStatusFilter(next);
    const resetModel = { ...paginationModel, page: 0 };
    setPaginationModel(resetModel);
    writeStateToUrl(resetModel, search, sortModel, next, dateFrom, dateTo, columnVisibility);
  };

  const handleColumnVisibilityChange = (model: GridColumnVisibilityModel) => {
    setColumnVisibility(model);
    writeStateToUrl(paginationModel, search, sortModel, statusFilter, dateFrom, dateTo, model);
  };

  const selectedIds =
    selectionModel.type === 'include'
      ? selectionModel.ids
      : new Set(launches.map((r) => r.id).filter((id) => !selectionModel.ids.has(id)));

  const handleResetFilters = () => {
    setSearch('');
    setDateFrom(null);
    setDateTo(null);
    setStatusFilter('all');
    const resetModel = { ...paginationModel, page: 0 };
    setPaginationModel(resetModel);
    writeStateToUrl(resetModel, '', sortModel, 'all', null, null, columnVisibility);
  };

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
    dateFrom,
    dateTo,
    handleDateFromChange,
    handleDateToChange,
    handleResetFilters,
    columnVisibility,
    handleColumnVisibilityChange,
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
