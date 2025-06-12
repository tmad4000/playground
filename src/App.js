import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import PollList from './components/PollList';
import CreatePoll from './components/CreatePoll';
import PollDetail from './components/PollDetail';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0066ff',
    },
    secondary: {
      main: '#ff4081',
    },
  },
});

function App() {
  const [view, setView] = React.useState('list');
  const [selectedPollId, setSelectedPollId] = React.useState(null);

  const handleCreatePoll = () => {
    setView('create');
  };

  const handleViewPoll = (pollId) => {
    setSelectedPollId(pollId);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedPollId(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          {view === 'list' && (
            <PollList 
              onCreatePoll={handleCreatePoll}
              onViewPoll={handleViewPoll}
            />
          )}
          {view === 'create' && (
            <CreatePoll onBack={handleBackToList} />
          )}
          {view === 'detail' && selectedPollId && (
            <PollDetail 
              pollId={selectedPollId}
              onBack={handleBackToList}
            />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 