import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import useVoteStore from '../store/voteStore';

function CreatePoll({ onBack }) {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const createPoll = useVoteStore(state => state.createPoll);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && options.every(opt => opt.trim())) {
      createPoll(title.trim(), options.map(opt => opt.trim()));
      onBack();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Create New Poll
        </Typography>
      </Box>

      <Stack spacing={3}>
        <TextField
          label="Poll Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
        />

        <Typography variant="h6">Options</Typography>
        
        {options.map((option, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              fullWidth
              required
            />
            <IconButton
              color="error"
              onClick={() => handleRemoveOption(index)}
              disabled={options.length <= 2}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddOption}
          variant="outlined"
        >
          Add Option
        </Button>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!title.trim() || !options.every(opt => opt.trim())}
        >
          Create Poll
        </Button>
      </Stack>
    </Box>
  );
}

export default CreatePoll; 