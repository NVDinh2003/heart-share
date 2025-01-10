import { configureStore } from "@reduxjs/toolkit";
import registerReducer from "../redux/Slices/RegisterSlice";
import userReducer from "../redux/Slices/UserSlice";
import postReducer from "../redux/Slices/PostSlice";
import modalReducer from "../redux/Slices/ModalSlice";
import gifReducer from "./Slices/GifSlice";
import feedReducer from "./Slices/FeedSlice";
import notificationReducer from "./Slices/NotificationSlice";
import messageReducer from "./Slices/MessagesSlice";
import exploreReducer from "./Slices/ExploreSlice";

export const store = configureStore({
  reducer: {
    register: registerReducer,
    user: userReducer,
    post: postReducer,
    modal: modalReducer,
    gif: gifReducer, // Thêm reducer cho gifs
    feed: feedReducer,
    notification: notificationReducer,
    message: messageReducer,
    explore: exploreReducer,
  },

  // middleware để kiểm tra tuần tự hóa nhưng bỏ qua một số hành động và đường dẫn nhất định.
  middleware: (getDefaulMiddleware) =>
    getDefaulMiddleware({
      serializableCheck: {
        ignoredActions: [
          "post/updateCurrentPostImages",
          "post.updateCurrentReplyImages",
          "feed/loadFeedPage",
          "feed/setSessionTime",
          "post/setScheduleDate",
        ],
        ignoredPaths: [
          "post.currentPostImages",
          "post.currentReplyImages",
          "feed.sessionStart",
          "post.currentPost.scheduledDate",
          "post.currentReply.scheduledDate",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
