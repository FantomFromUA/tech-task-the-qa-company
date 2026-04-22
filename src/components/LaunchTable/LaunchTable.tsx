import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Launch } from '../../hooks/useLaunches';
import { useLaunchTable } from './useLaunchTable';
import { LaunchDetailsDrawer } from '../LaunchDetailsDrawer/LaunchDetailsDrawer';

function getStatusLabel(row: Launch): string {
  if (row.success === true) return 'Success';
  if (row.success === false) return 'Failed';
  return 'Unknown';
}

function getStatusColor(row: Launch): 'success' | 'error' | 'default' {
  if (row.success === true) return 'success';
  if (row.success === false) return 'error';
  return 'default';
}

function formatDate(dateUtc: string): string {
  return new Date(dateUtc).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const COPY_FIELDS: { field: string; getValue: (row: Launch) => string }[] = [
  { field: 'flight_number', getValue: (row) => `#${row.flight_number}` },
  { field: 'name',          getValue: (row) => row.name },
  { field: 'date_utc',      getValue: (row) => formatDate(row.date_utc) },
  { field: 'success',       getValue: (row) => getStatusLabel(row) },
];

function makeRowFormatter(visibility: Record<string, boolean>) {
  return (row: Launch) =>
    COPY_FIELDS
      .filter(({ field }) => visibility[field] !== false)
      .map(({ getValue }) => getValue(row))
      .join(' | ');
}

const columns: GridColDef<Launch>[] = [
  { field: 'flight_number', headerName: '#', width: 60 },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'date_utc', headerName: 'Date', width: 140, valueFormatter: (value: string) => formatDate(value) },
  {
    field: 'success',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => (
      <Chip
        label={getStatusLabel(params.row)}
        color={getStatusColor(params.row)}
        size="small"
      />
    ),
  },
];

export function LaunchTable() {
  const {
    launches, totalDocs, loading, error,
    search, handleSearchChange,
    paginationModel, handlePaginationChange,
    sortModel, handleSortChange,
    statusFilter, handleStatusFilterChange,
    dateFrom, dateTo, handleDateFromChange, handleDateToChange, handleResetFilters,
    columnVisibility, handleColumnVisibilityChange,
    selectionModel, setSelectionModel,
    selectedIds, handleCopy,
    snackbarOpen, setSnackbarOpen,
    selectedLaunch, setSelectedLaunch,
  } = useLaunchTable();

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1 }}>
        {/* Row 1: Search + Date pickers (same row on desktop, stacked on mobile) */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 1, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search launches..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              type="date"
              label="From"
              value={dateFrom ?? ''}
              onChange={(e) => handleDateFromChange(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              type="date"
              label="To"
              value={dateTo ?? ''}
              onChange={(e) => handleDateToChange(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="success">Success</ToggleButton>
            <ToggleButton value="failed">Failed</ToggleButton>
            <ToggleButton value="unknown">Unknown</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleResetFilters}
            disabled={!search && statusFilter === 'all' && !dateFrom && !dateTo}
            sx={{
              color: 'success.main',
              borderColor: 'success.main',
              transition: 'all 0.2s ease',
              '&:hover:not(:disabled)': {
                backgroundColor: 'success.main',
                borderColor: 'success.main',
                color: 'white',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)',
              },
            }}
          >
            Reset filters
          </Button>
          <Tooltip title={selectedIds.size > 0 ? 'Copy selected rows to clipboard' : 'Select rows to copy'}>
            <span>
              <Button
                size="small"
                variant="outlined"
                disabled={selectedIds.size === 0}
                onClick={() => handleCopy(makeRowFormatter(columnVisibility))}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover:not(:disabled)': {
                    backgroundColor: 'primary.main',
                    borderColor: 'primary.main',
                    color: 'white',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                  },
                }}
              >
                {selectedIds.size > 0 ? `Copy ${selectedIds.size} selected` : 'Copy selected'}
              </Button>
            </span>
          </Tooltip>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{ height: { xs: 400, sm: 500 }, minWidth: 500 }}>
          <DataGrid
            rows={launches}
            columns={columns}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={handleSortChange}
            checkboxSelection
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={setSelectionModel}
            paginationMode="server"
            rowCount={totalDocs}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
            pageSizeOptions={[5, 10, 25, 50]}
            loading={loading}
            onRowClick={(params) => setSelectedLaunch(params.row)}
            columnVisibilityModel={columnVisibility}
            onColumnVisibilityModelChange={handleColumnVisibilityChange}
            slotProps={{ pagination: { showFirstButton: true, showLastButton: true } }}
            disableRowSelectionOnClick
            disableColumnFilter
            sx={{
              '& .MuiDataGrid-row': { cursor: 'pointer' },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-select, & .MuiTablePagination-selectIcon': {
                display: 'block',
              },
            }}
          />
        </Box>
      </Box>

      <LaunchDetailsDrawer
        launch={selectedLaunch}
        onClose={() => setSelectedLaunch(null)}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={`${selectedIds.size} row${selectedIds.size > 1 ? 's' : ''} copied to clipboard`}
      />
    </Box>
  );
}
