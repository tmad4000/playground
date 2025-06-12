import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import useVoteStore from '../store/voteStore';

function PollList({ onCreatePoll, onViewPoll }) {
  const { polls, deletePoll } = useVoteStore();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Votebox
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreatePoll}
        >
          Create Poll
        </Button>
      </Box>

      <Stack spacing={2}>
        {polls.map((poll) => (
          <Card key={poll.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {poll.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {poll.options.length} options • Created {new Date(poll.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => onViewPoll(poll.id)}
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => deletePoll(poll.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

export default PollList; 