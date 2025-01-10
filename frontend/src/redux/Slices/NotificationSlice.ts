import axios from "axios";
import { Notification } from "./../../utils/GlobalInterface";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { updateUnreadMessages } from "./MessagesSlice";

interface NotificationSliceState {
  newPostNotifications: Notification[];
  postActionNotifications: Notification[];
  mentionNotifications: Notification[];
  messageNotifications: Notification[];
  followNotifications: Notification[];
}

interface loadNotificationsPayload {
  userId: number;
  token: string;
}

interface ReadNotificationsPayload {
  notifications: Notification[];
  token: string;
}

const initialState: NotificationSliceState = {
  newPostNotifications: [],
  postActionNotifications: [],
  mentionNotifications: [],
  messageNotifications: [],
  followNotifications: [],
};
const baseUrl = process.env.REACT_APP_API_URL;

export const loadNotifications = createAsyncThunk(
  "notification/load",
  async (payload: loadNotificationsPayload, thunkAPI) => {
    try {
      let req = await axios.get(`${baseUrl}/notifications/${payload.userId}`, {
        headers: {
          Authorization: `Bearer ${payload.token}`,
        },
      });

      const data: Notification[] = req.data;
      const unreadMessages: Notification[] = data.filter(
        (notification) =>
          !notification.acknowledged &&
          notification.notificationType === "MESSAGE"
      );

      thunkAPI.dispatch(updateUnreadMessages(unreadMessages));

      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const readNotifications = createAsyncThunk(
  "notification/read",
  async (payload: ReadNotificationsPayload, thunkAPI) => {
    try {
      await axios.post(
        `${baseUrl}/notifications/acknowledge`,
        {
          notifications: payload.notifications,
        },
        {
          headers: {
            Authorization: `Bearer ${payload.token}`,
          },
        }
      );

      return payload.notifications;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const dispatchUnreadMessage = createAsyncThunk(
  "notification/unreadmessage",
  async (payload: Notification, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const existingUnread = state?.message?.unreadMessages;
    const allMessages = [...existingUnread, payload];
    thunkAPI.dispatch(updateUnreadMessages(allMessages));
  }
);

export const NotificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    recievedNotification(state, action: PayloadAction<Notification>) {
      const notificationExists = (
        notificationList: Notification[] | undefined,
        newNotification: Notification
      ) => {
        return (
          Array.isArray(notificationList) &&
          notificationList.some(
            (notification) =>
              notification.notificationId === newNotification.notificationId
          )
        );
      };

      switch (action.payload.notificationType) {
        case "NEW_POST":
          if (!notificationExists(state.newPostNotifications, action.payload)) {
            state.newPostNotifications = [
              action.payload,
              ...state.newPostNotifications,
            ];
          }
          return state;
        case "LIKE":
        case "REPOST":
        case "STAR":
          if (
            !notificationExists(state.postActionNotifications, action.payload)
          ) {
            state.postActionNotifications = [
              action.payload,
              ...state.postActionNotifications,
            ];
          }
          return state;
        case "REPLY":
        case "MENTION":
          if (!notificationExists(state.mentionNotifications, action.payload)) {
            state.mentionNotifications = [
              action.payload,
              ...state.mentionNotifications,
            ];
          }
          return state;
        case "MESSAGE":
          if (!Array.isArray(state.messageNotifications)) {
            state.messageNotifications = [];
          }
          if (!notificationExists(state.messageNotifications, action.payload)) {
            state.messageNotifications = [
              action.payload,
              ...state.messageNotifications,
            ];
          }
          return state;
        case "FOLLOW":
          if (!notificationExists(state.followNotifications, action.payload)) {
            state.followNotifications = [
              action.payload,
              ...state.followNotifications,
            ];
          }
          return state;
        default:
          return state;
      }
    },
    readMessageNotifications(state, action: PayloadAction<Notification[]>) {
      state = {
        ...state,
        messageNotifications: action.payload,
      };
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadNotifications.fulfilled, (state, action) => {
      let posts: Notification[] = [];
      let mentions: Notification[] = [];
      let messages: Notification[] = [];
      let follow: Notification[] = [];

      let allNotifications: Notification[] = action.payload;
      for (let notification of allNotifications) {
        switch (notification.notificationType) {
          case "LIKE":
          case "REPOST":
          case "STAR":
            posts.push(notification);
            break;
          case "REPLY":
          case "MENTION":
            mentions.push(notification);
            break;
          case "FOLLOW":
            follow.push(notification);
            break;
          default:
            messages.push(notification);
        }
      }

      state = {
        ...state,
        postActionNotifications: posts,
        mentionNotifications: mentions,
        followNotifications: follow,
        messageNotifications: messages,
      };

      return state;
    });

    builder.addCase(readNotifications.fulfilled, (state, action) => {
      let posts: Notification[] = [];
      let mentions: Notification[] = [];
      let messages: Notification[] = [];
      let follow: Notification[] = [];

      if (
        action.payload.length > 0 &&
        action.payload[0].notificationType === "NEW_POST"
      ) {
        state = {
          ...state,
          newPostNotifications: [],
        };
        return state;
      }

      let allNotifications = [
        ...state.postActionNotifications,
        ...state.mentionNotifications,
        ...state.followNotifications,
        ...state.messageNotifications,
      ];

      let readNotifications = action.payload.map((notification) => {
        return {
          ...notification,
          acknowledged: true,
        };
      });

      for (let i = 0; i < allNotifications.length; i++) {
        for (let j = 0; j < readNotifications.length; j++) {
          if (
            allNotifications[i].notificationId ===
            readNotifications[j].notificationId
          ) {
            allNotifications.splice(i, 1, readNotifications[j]);
          }
        }
      }

      for (let notification of allNotifications) {
        switch (notification.notificationType) {
          case "LIKE":
          case "REPOST":
          case "STAR":
            posts.push(notification);
            break;
          case "REPLY":
          case "MENTION":
            mentions.push(notification);
            break;
          case "FOLLOW":
            follow.push(notification);
            break;
          default:
            messages.push(notification);
        }
      }

      state = {
        ...state,
        postActionNotifications: posts,
        mentionNotifications: mentions,
        followNotifications: follow,
        messageNotifications: messages,
      };

      return state;
    });
  },
});

export const { recievedNotification, readMessageNotifications } =
  NotificationSlice.actions;

export default NotificationSlice.reducer;
