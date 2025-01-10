import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Conversation,
  ConversationUser,
  CreateMessageDTO,
  Notification as INotification,
  Message,
  User,
} from "../../utils/GlobalInterface";
import axios from "axios";
import { readMessageNotifications } from "./NotificationSlice";

const baseURL = process.env.REACT_APP_API_URL;

interface MessagesSliceState {
  unreadMessages: INotification[];
  popupOpen: boolean;
  conversationOpen: boolean;
  createGroup: boolean;
  gifUrl: string | null;
  conversationUsers: ConversationUser[];
  conversations: Conversation[];
  initComplete: boolean;
  conversation: Conversation | undefined;
  replyToMessage: Message | undefined;
  loading: boolean;
  error: boolean;
}

interface LoadConversationsPayload {
  userId: number;
  token: string;
}

interface OpenConversationPayload {
  token: string;
  conversationUsers: ConversationUser[];
}

interface SendMessagePayload {
  messagePayload: CreateMessageDTO;
  image: File | null;
  token: string;
}

interface SendReplyPayload {
  messagePayload: CreateMessageDTO;
  image: File | null;
  replyTo: string;
  token: string;
}

interface ReadMessagesPayload {
  userId: number;
  conversationId: number;
  token: string;
}

interface ReactToMessagePayload {
  user: User;
  message: Message;
  reaction: string;
  token: string;
}

interface HideMessagePayload {
  user: User;
  message: Message;
  token: string;
}

const initialState: MessagesSliceState = {
  unreadMessages: [],
  popupOpen: false,
  createGroup: false,
  gifUrl: null,
  conversationOpen: false,
  conversationUsers: [],
  conversations: [],
  initComplete: false,
  conversation: undefined,
  replyToMessage: undefined,
  loading: false,
  error: false,
};

export const loadConversations = createAsyncThunk(
  "message/load",
  async (payload: LoadConversationsPayload, thunkAPI) => {
    try {
      const req = await axios.get(
        `http://localhost:8000/conversations?userId=${payload.userId}`,
        {
          headers: {
            Authorization: `Bearer ${payload.token}`,
          },
        }
      );

      return req.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const openConversation = createAsyncThunk(
  "message/open",
  async (payload: OpenConversationPayload, thunkAPI) => {
    const state: any = thunkAPI.getState();
    let conversations: Conversation[] = state?.message?.conversations;

    if (conversations) {
      let selectedConversationUsers = payload.conversationUsers.map(
        (u) => u.userId
      );
      let allConversationsWithUserIds = conversations.map((c) => {
        return {
          ...c,
          conversationUsers: c.conversationUsers.map((u) => u.userId),
        };
      });
      for (let i = 0; i < allConversationsWithUserIds.length; i++) {
        if (
          allConversationsWithUserIds[i].conversationUsers.sort().join(",") ===
          selectedConversationUsers.sort().join(",")
        ) {
          return conversations.filter(
            (c) =>
              c.conversationId === allConversationsWithUserIds[i].conversationId
          )[0];
        }
      }
    }
    try {
      let req = await axios.post(
        "http://localhost:8000/conversations",
        {
          userIds: payload.conversationUsers.map((u) => u.userId),
        },
        {
          headers: {
            Authorization: `Bearer ${payload.token}`,
          },
        }
      );

      let conversation = req.data;

      return conversation;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

const generateMessageFormData = (
  messagePayload: CreateMessageDTO,
  image: File | null
): FormData => {
  let data = new FormData();

  data.append("messagePayload", JSON.stringify(messagePayload));

  if (image !== null) {
    data.append("image", image);
  } else {
    data.append("image", new Blob([], { type: "file" }));
  }

  return data;
};

export const sendMessage = createAsyncThunk(
  "message/send",
  async (payload: SendMessagePayload, thunkAPI) => {
    let data = generateMessageFormData(payload.messagePayload, payload.image);

    let config = {
      method: "post",
      url: "http://localhost:8000/message",
      headers: {
        Authorization: `Bearer ${payload.token}`,
        "Content-Type": "multipart/form-data",
      },
      data,
    };

    let res = await axios(config);

    thunkAPI.dispatch(recievedMessage(res.data));

    return data;
  }
);

export const sendReply = createAsyncThunk(
  "message/reply",
  async (payload: SendReplyPayload, thunkAPI) => {
    let data = generateMessageFormData(payload.messagePayload, payload.image);
    data.append("replyTo", payload.replyTo);

    let config = {
      method: "post",
      url: "http://localhost:8000/message/reply",
      headers: {
        Authorization: `Bearer ${payload.token}`,
        "Content-Type": "multipart/form-data",
      },
      data,
    };

    let res = await axios(config);

    thunkAPI.dispatch(recievedMessage(res.data));
  }
);

export const readMessages = createAsyncThunk(
  "message/read",
  async (payload: ReadMessagesPayload, thunkAPI) => {
    try {
      let res = await axios.get(
        `http://localhost:8000/message/read?userId=${payload.userId}&conversationId=${payload.conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${payload.token}`,
          },
        }
      );

      thunkAPI.dispatch(readMessageNotifications(res.data));

      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const reactToMessage = createAsyncThunk(
  "message/react",
  async (payload: ReactToMessagePayload, thunkAPI) => {
    try {
      let body = {
        user: payload.user,
        messageId: payload.message.messageId,
        reaction: payload.reaction,
      };
      let res = await axios.post("http://localhost:8000/message/react", body, {
        headers: {
          Authorization: `Bearer ${payload.token}`,
        },
      });

      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const hideMessage = createAsyncThunk(
  "message/hide",
  async (payload: HideMessagePayload, thunkAPI) => {
    try {
      let body = {
        user: payload.user,
        messageId: payload.message.messageId,
      };
      let res = await axios.post("http://localhost:8000/message/hide", body, {
        headers: {
          Authorization: `Bearer ${payload.token}`,
        },
      });

      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const MessageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    togglePopup: (state) => {
      state = {
        ...state,
        popupOpen: !state.popupOpen,
      };
      return state;
    },
    toggleCreateGroup: (state) => {
      state = {
        ...state,
        createGroup: !state.createGroup,
      };
      return state;
    },
    updateGifUrl(state, action: PayloadAction<string | null>) {
      state = {
        ...state,
        gifUrl: action.payload,
      };
      return state;
    },
    recievedMessage(state, action: PayloadAction<Message>) {
      let conversations: Conversation[] = JSON.parse(
        JSON.stringify(state.conversations)
      );
      let conversation = conversations.find(
        (c) => c.conversationId === action.payload.conversationId
      );

      if (!conversation) return state;

      let conversationIdx = conversations.indexOf(conversation);

      let messages = [...conversation.conversationMessage, action.payload];

      conversation = {
        ...conversation,
        conversationMessage: messages,
      };

      conversations.splice(conversationIdx, 1);
      conversations = [conversation, ...conversations];

      state = {
        ...state,
        conversations,
        conversation:
          state.conversation &&
          conversation.conversationId === action.payload.conversationId
            ? conversation
            : state.conversation,
      };

      return state;
    },

    updateReplyToMessage(state, action: PayloadAction<Message | undefined>) {
      state = {
        ...state,
        replyToMessage: action.payload,
      };
      return state;
    },

    updateUnreadMessages: (state, action: PayloadAction<INotification[]>) => {
      state = {
        ...state,
        unreadMessages: action.payload,
      };
      return state;
    },
    updateConversationUsers: (
      state,
      action: PayloadAction<ConversationUser[]>
    ) => {
      state = {
        ...state,
        conversationUsers: action.payload,
      };
      return state;
    },
    selectConversation(state, action: PayloadAction<Conversation | undefined>) {
      state = {
        ...state,
        conversationOpen: action.payload !== undefined,
        conversation: action.payload,
      };

      return state;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadConversations.pending, (state, action) => {
        state = {
          ...state,
          error: false,
          loading: true,
        };
        return state;
      })
      .addCase(loadConversations.fulfilled, (state, action) => {
        state = {
          ...state,
          conversations: action.payload,
          loading: false,
          initComplete: true,
        };
        return state;
      })
      .addCase(loadConversations.rejected, (state, action) => {
        state = {
          ...state,
          error: true,
          loading: false,
        };
        return state;
      });

    // read messages
    builder.addCase(readMessages.fulfilled, (state, action) => {
      const { readMessages, conversation, notifications } = action.payload;
      const updatedUnreadMessages: INotification[] = [];
      readMessages.forEach((message: Message) => {
        state.unreadMessages.forEach((unreadMessage) => {
          if (
            unreadMessage.message &&
            message.messageId !== unreadMessage.message.messageId
          ) {
            updatedUnreadMessages.push(unreadMessage);
          }
        });
      });
      state = {
        ...state,
        unreadMessages: updatedUnreadMessages,
      };
      if (state.conversation) {
        const updatedConversations = state.conversations.map((c) => {
          if (c.conversationId === conversation.conversationId) {
            return conversation;
          }
          return c;
        });
        state = {
          ...state,
          conversation,
          conversations: updatedConversations,
        };
      }
      return state;
    });

    builder
      .addCase(openConversation.pending, (state, action) => {
        state = {
          ...state,
          error: false,
          loading: true,
        };
        return state;
      })
      .addCase(openConversation.fulfilled, (state, action) => {
        state = {
          ...state,
          loading: false,
          popupOpen: true,
          conversationOpen: true,
          conversation: action.payload,
          conversationUsers: [],
        };

        if (
          !state.conversations.some(
            (c) => c.conversationId === action.payload.conversationId
          )
        ) {
          state = {
            ...state,
            conversations: [action.payload, ...state.conversations],
          };
        }
        return state;
      })
      .addCase(openConversation.rejected, (state, action) => {
        state = {
          ...state,
          error: true,
          loading: false,
        };
        return state;
      });

    // react to message
    builder.addCase(reactToMessage.fulfilled, (state, action) => {
      if (state.conversation) {
        let messages = state.conversation.conversationMessage.map((message) => {
          if (message.messageId == action.payload.messageId) {
            return action.payload;
          }

          return message;
        });
        let updatedConversation = {
          ...state.conversation,
          conversationMessage: messages,
        };
        let updatedConversations = state.conversations.map((conversation) => {
          if (conversation.conversationId === action.payload.conversationId) {
            return updatedConversation;
          }
          return conversation;
        });
        state = {
          ...state,
          conversation: updatedConversation,
          conversations: updatedConversations,
        };
      }

      return state;
    });
  },
});

export const {
  togglePopup,
  toggleCreateGroup,
  updateUnreadMessages,
  updateConversationUsers,
  selectConversation,
  updateGifUrl,
  recievedMessage,
  updateReplyToMessage,
} = MessageSlice.actions;

export default MessageSlice.reducer;
