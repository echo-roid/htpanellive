import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch all projects


// Async thunk to fetch tasks for a project


export const fetchTasks = createAsyncThunk("task/fetchTasks", async (projectId) => {
   
  });
  

// Async thunk to create a task


const taskSlice = createSlice({
  name: "task",
  initialState: {
    taskList: [],  // Store tasks here
    projectList: [],  // Store projects here
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Handling projects fetching
    builder
      
      // Handling tasks fetching
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.taskList = action.payload;  // Store tasks separately
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Handling task creation
     
  },
});

export default taskSlice.reducer;
