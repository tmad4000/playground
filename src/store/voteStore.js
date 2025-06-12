import { create } from 'zustand';

const useVoteStore = create((set) => ({
  polls: [],
  currentPoll: null,

  // Create a new poll
  createPoll: (title, options) => set((state) => ({
    polls: [...state.polls, {
      id: Date.now(),
      title,
      options: options.map(option => ({
        id: Date.now() + Math.random(),
        text: option,
        votes: 0
      })),
      createdAt: new Date().toISOString()
    }]
  })),

  // Vote on an option
  vote: (pollId, optionId) => set((state) => ({
    polls: state.polls.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          options: poll.options.map(option => {
            if (option.id === optionId) {
              return { ...option, votes: option.votes + 1 };
            }
            return option;
          })
        };
      }
      return poll;
    })
  })),

  // Set current poll
  setCurrentPoll: (pollId) => set((state) => ({
    currentPoll: state.polls.find(poll => poll.id === pollId)
  })),

  // Delete a poll
  deletePoll: (pollId) => set((state) => ({
    polls: state.polls.filter(poll => poll.id !== pollId)
  }))
}));

export default useVoteStore; 