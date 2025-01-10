import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./assets/global.css";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import { Landing } from "./pages/Landing";
import { Theme } from "./utils/GlobalInterface";
import { LayoutPage } from "./pages/LayoutPage";
import { Feed } from "./features/feed/components/Feed/Feed";
import { Profile } from "./pages/Profile";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./redux/Store";
import { useEffect } from "react";
import { ViewPost } from "./pages/ViewPost";
import { useWebSocket } from "./hooks/useWebsocket";
import NotificationsPage from "./pages/NotificationsPage";
import { toast } from "react-toastify";
import axios from "axios";
import { Authenticate } from "./features/auth/Authenticate";

import "./assets/css/index.css";
import "./assets/css/tailwind.css";
import { FollowersPage } from "./pages/user/FollowersPage";
import { FollowingPage } from "./pages/user/FollowingPage";
import { loadConversations } from "./redux/Slices/MessagesSlice";

const theme: Theme = {
  colors: {
    blue: "#1DA1F2",
    black: "#14171a",
    darkGray: "#657786",
    gray: "#AAB8C2",
    lightGray: "#E1E8ED",
    white: "#F5F8FA",
    error: "red",
  },
};

const GlobalStyle = createGlobalStyle`
*{
  font-family:'IBM Plex Sans', sans-serif;
  /* font-family:"Ubuntu", "sans-serif"; */
  font-weight: bold;
}`;

export const App = () => {
  const user = useSelector((state: RootState) => state.user);
  const messageState = useSelector((state: RootState) => state.message);
  const dispatch: AppDispatch = useDispatch();
  const { connected, connect, disconnect } = useWebSocket();

  useEffect(() => {
    if (user.loggedIn && user.token && !messageState.initComplete) {
      dispatch(
        loadConversations({
          userId: user.loggedIn.userId,
          token: user.token,
        })
      );
    }
    if (user.loggedIn && messageState.initComplete && !connected) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [user.loggedIn, user.token, messageState.initComplete]);

  // Cấu hình interceptor cho axios
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Xử lý lỗi response
          let errorMessage = "Đã xảy ra lỗi";
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message; // Lấy thông điệp lỗi từ server
          } else {
            // Nếu không có thông điệp lỗi cụ thể từ server
            switch (error.response.status) {
              case 401:
                errorMessage = "Lỗi xác thực. Vui lòng đăng nhập lại.";
                break;
              case 404:
                errorMessage = "Không tìm thấy tài nguyên yêu cầu.";
                break;
              case 500:
                errorMessage = "Lỗi server. Vui lòng thử lại sau.";
                break;
              default:
                errorMessage = `Đã xảy ra lỗi: ${error.message}`;
            }
          }
          toast.error(errorMessage); // Hiển thị thông điệp lỗi
        } else if (error.request) {
          // Yêu cầu được gửi nhưng không nhận được phản hồi
          toast.error(
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối của bạn."
          );
        } else {
          // Có lỗi khi thiết lập request
          toast.error(`Đã xảy ra lỗi: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor khi component unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<Landing></Landing>} />
          <Route path="/authenticate" element={<Authenticate />} />

          <Route path="" element={<LayoutPage />}>
            <Route path="/home" element={<Feed />} />
            <Route path="/explore" element={<>Explore Page</>} />
            <Route path="/:username" element={<Profile />} />
            <Route path="/:username/followers" element={<FollowersPage />} />
            <Route path="/:username/following" element={<FollowingPage />} />
            <Route path="/post/:postId" element={<ViewPost />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            <Route
              path="/notifications/verified"
              element={<NotificationsPage />}
            />
            <Route
              path="/notifications/mentions"
              element={<NotificationsPage />}
            />
          </Route>

          {/* <Route path="/home" element={<Home></Home>} /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
};
