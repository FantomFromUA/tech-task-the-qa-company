import { Container, Typography } from '@mui/material';
import { LaunchTable } from './components/LaunchTable/LaunchTable';

export default function App() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }} gutterBottom>
        SpaceX Launches
      </Typography>
      <LaunchTable />
    </Container>
  );
}
