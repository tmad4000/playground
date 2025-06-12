import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  LinearProgress,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useVoteStore from '../store/voteStore';

function PollDetail({ pollId, onBack }) {
  const { polls, vote, setCurrentPoll, currentPoll } = useVoteStore();

  useEffect(() => {
    setCurrentPoll(pollId);
  }, [pollId, setCurrentPoll]);

  if (!currentPoll) return null;

  const totalVotes = currentPoll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          {currentPoll.title}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {currentPoll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          
          return (
            <Card key={option.id}>
              <CardContent>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {option.text}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {option.votes} votes ({percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => vote(currentPoll.id, option.id)}
                  fullWidth
                >
                  Vote
                </Button>
              </CardContent>
            </Card>
          );
        })}

        <Typography variant="body2" color="text.secondary" align="center">
          Total votes: {totalVotes}
        </Typography>
      </Stack>
    </Box>
  );
}

export default PollDetail; 