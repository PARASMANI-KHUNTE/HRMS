import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

const token = localStorage.getItem('token');
let user = null;
if (token) {
  try {
    const decodedToken = jwtDecode(token);
    // Check if token is expired
    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      token = null;
      user = null;
    } else {
      user = decodedToken;
    }
  } catch (error) {
    console.error("Failed to decode token on initial load:", error);
    localStorage.removeItem('token');
    token = null;
    user = null;
  }
}

const initialState = {
  token: token || null,
  user: user || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      try {
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
      } catch (error) {
        console.error('Error in login reducer:', error);
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    },
    setUser: (state, action) => {
      state.user = action.payload;
    }
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
