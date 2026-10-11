import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch employees
export const fetchEmployees = createAsyncThunk("employee/fetchEmployees", async () => {
  const response = await fetch("http://localhost:5000/api/employees");
  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }
  const data = await response.json();
  return data;
});

const employeeSlice = createSlice({
  name: "employee",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addEmployee: (state, action) => {
      state.list.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
