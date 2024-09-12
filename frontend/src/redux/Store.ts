import { configureStore } from "@reduxjs/toolkit";
import registerReducer from "../redux/Slices/RegisterSlice";
import userReducer from "../redux/Slices/UserSlice";
import postReducer from "../redux/Slices/PostSlice";
import modalReducer from "../redux/Slices/ModalSlice";
import gifReducer from "./Slices/GifSlice";
import feedReducer from "./Slices/FeedSlice";

export const store = configureStore({
  reducer: {
    register: registerReducer,
    user: userReducer,
    post: postReducer,
    modal: modalReducer,
    gif: gifReducer, // Thêm reducer cho gifs
    feed: feedReducer,
  },

  // middleware để kiểm tra tuần tự hóa nhưng bỏ qua một số hành động và đường dẫn nhất định.
  middleware: (getDefaulMiddleware) =>
    getDefaulMiddleware({
      serializableCheck: {
        ignoredActions: ["post/updateCurrentPostImages"],
        ignoredPaths: ["post.currentPostImages"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
