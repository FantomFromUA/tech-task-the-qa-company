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
  Typography,
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

function formatRowForCopy(row: Launch): string {
  return `#${row.flight_number} | ${row.name} | ${formatDate(row.date_utc)} | ${getStatusLabel(row)}`;
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

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', md: 'center' },
        mb: 1,
        gap: 1.5,
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
        }}>
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              Filter by status:
            </Typography>
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
          </Box>
        </Box>

        {selectedIds.size > 0 && (
          <Tooltip title="Copy selected rows to clipboard">
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleCopy(formatRowForCopy)}
              sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
            >
              Copy {selectedIds.size} selected
            </Button>
          </Tooltip>
        )}
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
            disableRowSelectionOnClick
            sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
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
