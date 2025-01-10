import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { User } from "../../utils/GlobalInterface";
import axios from "axios";
import { getFollowers, getFollowing } from "../../services/UserService";
import { cleanDateForRequest } from "../../utils/DateUtils";

const baseURL = process.env.REACT_APP_API_URL;

interface UserSliceState {
  loggedIn: User | undefined;
  following: User[];
  followers: User[];
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
interface followUserBody {
  token: string;
  followee: string;
}

interface UpdateUserInfoPayload {
  firstName: string;
  lastName: string;
  nickname: string;
  bio: string;
  dateOfBirth: string;
}

const initialState: UserSliceState = {
  loggedIn: undefined,
  following: [],
  followers: [],
  username: "",
  token: "",
  fromRegister: false,
  error: false,
};

export const verifyUsername = createAsyncThunk(
  "user/username",
  async (body: VerifyUserBody, thunkAPI) => {
    try {
      const req = await axios.post(`${baseURL}/auth/find`, body);
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
      const req = await axios.get(`${baseURL}/users/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = req.data;

      // console.log(user.user);

      const followers = getFollowers(user.username);
      const following = getFollowing(user.username);

      let followingAndFollowers = await Promise.all([followers, following]);

      // console.log(user);
      return {
        loggedIn: user,
        followers: followingAndFollowers[0],
        following: followingAndFollowers[1],
      };
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const followUser = createAsyncThunk(
  "user/follow",
  async (body: followUserBody, thunkAPI) => {
    try {
      const req = await axios.put(
        `${baseURL}/users/follow`,
        {
          followedUser: body.followee,
        },
        {
          headers: {
            Authorization: `Bearer ${body.token}`,
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
      const req = await axios.post(`${baseURL}/auth/login`, body);
      const user = req.data;

      // console.log(user.user);

      const followers = getFollowers(user.user.username);
      const following = getFollowing(user.user.username);

      let followingAndFollowers = await Promise.all([followers, following]);

      return {
        loggedIn: user,
        followers: followingAndFollowers[0],
        following: followingAndFollowers[1],
      };
    } catch (e) {
      console.log("login failed");
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const updateProfilePicture = createAsyncThunk(
  "user/updateProfilePicture",
  async (body: { token: string; file: File }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("image", body.file);

      const req = await axios.post(`${baseURL}/users/pfp`, formData, {
        headers: {
          Authorization: `Bearer ${body.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return req.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const updateBannerPicture = createAsyncThunk(
  "user/updateBannerPicture",
  async (body: { token: string; file: File }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("image", body.file);

      const req = await axios.post(`${baseURL}/users/banner`, formData, {
        headers: {
          Authorization: `Bearer ${body.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return req.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

// Modify the updateUserInfo thunk
export const updateUserInfo = createAsyncThunk(
  "user/updateUserInfo",
  async (body: { token: string; userInfo: Partial<User> }, thunkAPI) => {
    try {
      const userInfoPayload: UpdateUserInfoPayload = {
        firstName: body.userInfo.firstName!,
        lastName: body.userInfo.lastName!,
        nickname: body.userInfo.nickname!,
        bio: body.userInfo.bio!,
        dateOfBirth: cleanDateForRequest(body.userInfo.dateOfBirth!),
      };

      const req = await axios.put(`${baseURL}/users/update`, userInfoPayload, {
        headers: {
          Authorization: `Bearer ${body.token}`,
        },
      });

      const updatedUser = req.data;
      // updatedUser.dateOfBirth = convertDateStringToDob(updatedUser.dateOfBirth);

      return updatedUser;
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

    // Thêm action để reset state
    resetUserState(state) {
      state.loggedIn = undefined;
      state.following = [];
      state.followers = [];
      state.username = "";
      state.token = "";
      state.fromRegister = false;
      state.error = false;
    },

    //
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state = {
        ...state,
        loggedIn: {
          userId: action.payload.loggedIn.user.userId,
          firstName: action.payload.loggedIn.user.firstName,
          lastName: action.payload.loggedIn.user.lastName,
          email: action.payload.loggedIn.user.email,
          phone: action.payload.loggedIn.user.phone,
          dateOfBirth: action.payload.loggedIn.user.dateOfBirth,
          username: action.payload.loggedIn.user.username,
          bio: action.payload.loggedIn.user.bio,
          nickname: action.payload.loggedIn.user.nickname,
          profilePicture: action.payload.loggedIn.user.profilePicture,
          bannerPicture: action.payload.loggedIn.user.bannerPicture,
          verifiedAccount: action.payload.loggedIn.user.verifiedAccount,
          privateAccount: action.payload.loggedIn.user.privateAccount,
          organization: action.payload.loggedIn.user.organization,
          location: action.payload.loggedIn.user.location,
          createTimestamp: action.payload.loggedIn.user.createTimestamp,
        },
        token: action.payload.loggedIn.token, // JWT token
        followers: action.payload.followers,
        following: action.payload.following,
      };
      return state;
    });

    builder
      .addCase(verifyUsername.fulfilled, (state, action) => {
        state = {
          ...state,
          username: action.payload,
        };
        return state;
      })
      .addCase(verifyUsername.pending, (state, action) => {
        state = {
          ...state,
          error: false,
        };
        return state;
      })
      .addCase(verifyUsername.rejected, (state, action) => {
        state = {
          ...state,
          error: true,
        };
        return state;
      });

    builder
      .addCase(loginUser.pending, (state, action) => {
        state = {
          ...state,
          error: false,
        };
        return state;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state = {
          ...state,
          error: true,
        };
        return state;
      });

    builder
      .addCase(getUserByToken.fulfilled, (state, action) => {
        state = {
          ...state,
          loggedIn: action.payload.loggedIn,
          username: action.payload.loggedIn.username,
          followers: action.payload.followers,
          following: action.payload.following,
        };

        return state;
      })
      .addCase(getUserByToken.pending, (state, action) => {
        state = {
          ...state,
          error: false,
        };
        return state;
      })
      .addCase(getUserByToken.rejected, (state, action) => {
        state = {
          ...state,
          error: true,
        };
        return state;
      });

    // follow user
    builder
      .addCase(followUser.pending, (state, action) => {
        state = {
          ...state,
          error: false,
        };
        return state;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state = {
          ...state,
          following: action.payload,
        };
        return state;
      })
      .addCase(followUser.rejected, (state, action) => {
        state = {
          ...state,
          error: true,
        };
        return state;
      });

    // upload profile and banner picture
    builder
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        if (state.loggedIn) {
          state.loggedIn.profilePicture = action.payload.profilePicture;
        }
      })
      .addCase(updateBannerPicture.fulfilled, (state, action) => {
        if (state.loggedIn) {
          state.loggedIn.bannerPicture = action.payload.bannerPicture;
        }
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        if (state.loggedIn) {
          state.loggedIn = {
            ...state.loggedIn,
            ...action.payload,
          };
        }
      });

    //
  },
});

export const { setFromRegister, resetUsername, setToken, resetUserState } =
  UserSlice.actions;

export default UserSlice.reducer;
