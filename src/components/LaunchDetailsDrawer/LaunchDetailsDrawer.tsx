import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Launch } from '../../hooks/useLaunches';

interface LaunchDetailsDrawerProps {
  readonly launch: Launch | null;
  readonly onClose: () => void;
}

function getStatusLabel(launch: Launch): string {
  if (launch.success === true) return 'Success';
  if (launch.success === false) return 'Failed';
  return 'Unknown';
}

function getStatusColor(launch: Launch): 'success' | 'error' | 'default' {
  if (launch.success === true) return 'success';
  if (launch.success === false) return 'error';
  return 'default';
}

export function LaunchDetailsDrawer({ launch, onClose }: LaunchDetailsDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={launch !== null}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 420 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {launch && (
        <>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            p: { xs: 2, sm: 3 },
            pb: 1,
            flexShrink: 0,
          }}>
            {launch.links.patch.small ? (
              <Box
                component="img"
                src={launch.links.patch.small}
                alt={`${launch.name} patch`}
                sx={{ width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 }, objectFit: 'contain' }}
              />
            ) : (
              <Box sx={{ width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 } }} />
            )}
            <IconButton onClick={onClose} size="small" aria-label="Close details">
              <CloseIcon />
            </IconButton>
          </Box>

          <Stack
            spacing={2}
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: { xs: 2, sm: 3 },
              pb: { xs: 3, sm: 3 },
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
              >
                {launch.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Flight #{launch.flight_number}
              </Typography>
            </Box>

            <Divider />

            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Date</Typography>
                <Typography variant="body2">{new Date(launch.date_utc).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip label={getStatusLabel(launch)} color={getStatusColor(launch)} size="small" />
              </Box>
            </Stack>

            <Divider />

            {launch.details ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>About this mission</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {launch.details}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No details available for this mission.
              </Typography>
            )}

            {(launch.links.webcast || launch.links.article || launch.links.wikipedia) && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Links</Typography>
                  <Stack spacing={1.5}>
                    {launch.links.webcast && (
                      <Link href={launch.links.webcast} target="_blank" rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <YouTubeIcon fontSize="small" />
                        <Typography variant="body2">Watch webcast</Typography>
                      </Link>
                    )}
                    {launch.links.article && (
                      <Link href={launch.links.article} target="_blank" rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArticleIcon fontSize="small" />
                        <Typography variant="body2">Read article</Typography>
                      </Link>
                    )}
                    {launch.links.wikipedia && (
                      <Link href={launch.links.wikipedia} target="_blank" rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MenuBookIcon fontSize="small" />
                        <Typography variant="body2">Wikipedia</Typography>
                      </Link>
                    )}
                  </Stack>
                </Box>
              </>
            )}
          </Stack>
        </>
      )}
    </Drawer>
  );
}