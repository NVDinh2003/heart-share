import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { User } from "../../utils/GlobalInterface";
import axios from "axios";

interface UserSliceState {
  loggedIn: User | undefined;
  username: string;
  token: string;
  fromRegister: boolean;
  error: boolean;
}

interface LoginBody {
  username: string;
  password: string;
}

interface VerifyUserBody {
  email: string;
  phone: string;
  username: string;
}

const initialState: UserSliceState = {
  loggedIn: undefined,
  username: "",
  token: "",
  fromRegister: false,
  error: false,
};

export const verifyUsername = createAsyncThunk(
  "user/username",
  async (body: VerifyUserBody, thunkAPI) => {
    try {
      const req = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/find`,
        body
      );
      return req.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const getUserByToken = createAsyncThunk(
  "user/get",
  async (token: string, thunkAPI) => {
    try {
      const req = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/verify`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return req.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (body: LoginBody, thunkAPI) => {
    try {
      const req = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        body
      );
      return req.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setFromRegister(state, action: PayloadAction<boolean>) {
      state = {
        ...state,
        fromRegister: action.payload,
      };

      return state;
    },

    resetUsername(state) {
      state = {
        ...state,
        username: "",
      };

      return state;
    },

    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },

    //
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state = {
        ...state,
        loggedIn: {
          userId: action.payload.user.userId,
          firstName: action.payload.user.firstName,
          lastName: action.payload.user.lastName,
          email: action.payload.user.email,
          phone: action.payload.user.phone,
          dateOfBirth: action.payload.user.dateOfBirth,
          username: action.payload.user.username,
          bio: action.payload.user.bio,
          nickname: action.payload.user.nickname,
          profilePicture: action.payload.user.profilePicture,
          bannerPicture: action.payload.user.bannerPicture,
        },
        token: action.payload.token, // JWT token
      };
      return state;
    });

    builder.addCase(verifyUsername.fulfilled, (state, action) => {
      state = {
        ...state,
        username: action.payload,
      };
      return state;
    });

    builder.addCase(verifyUsername.pending, (state, action) => {
      state = {
        ...state,
        error: false,
      };
      return state;
    });

    builder.addCase(verifyUsername.rejected, (state, action) => {
      state = {
        ...state,
        error: true,
      };
      return state;
    });

    builder.addCase(loginUser.pending, (state, action) => {
      state = {
        ...state,
        error: false,
      };
      return state;
    });

    builder.addCase(loginUser.rejected, (state, action) => {
      state = {
        ...state,
        error: true,
      };
      return state;
    });

    builder.addCase(getUserByToken.fulfilled, (state, action) => {
      state = {
        ...state,
        loggedIn: action.payload,
        username: action.payload.username,
      };

      return state;
    });

    builder.addCase(getUserByToken.pending, (state, action) => {
      state = {
        ...state,
        error: false,
      };
      return state;
    });

    builder.addCase(getUserByToken.rejected, (state, action) => {
      state = {
        ...state,
        error: true,
      };
      return state;
    });
    //
  },
});

export const { setFromRegister, resetUsername, setToken } = UserSlice.actions;

export default UserSlice.reducer;
