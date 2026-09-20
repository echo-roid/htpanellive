import { createSlice } from '@reduxjs/toolkit';

const leadSlice = createSlice({
  name: 'lead',
  initialState: {
    leadId: null, // To store only the id
  },
  reducers: {
    setLeadId: (state, action) => {
      state.leadId = action.payload; // Save the provided id
    },
    resetLeadId: (state) => {
      state.leadId = null; // Clear the id if needed
    },
  },
});

export const { setLeadId, resetLeadId } = leadSlice.actions;

export default leadSlice.reducer;
