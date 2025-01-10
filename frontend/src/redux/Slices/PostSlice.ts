import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  Poll,
  PollChoice,
  Post,
  PostImage,
  Reply,
  User,
} from "../../utils/GlobalInterface";
import axios from "axios";
import FormData from "form-data";
import { loadFeedPage, setSessionTime, updatePost } from "./FeedSlice";

export interface PostSliceState {
  loading: boolean;
  error: boolean;
  currentPost: Post | undefined;
  currentPostImages: File[];
  currentReplyImages: File[];
  currentReply: Reply | undefined;
  batchedViews: number[];
}

interface updatePostPayload {
  name: string;
  value: string | number | boolean | PostImage[];
}

interface GenerateReplyPayload {
  post: Post;
  user: User;
}

interface createPostBody {
  content: string;
  author: User;
  images: PostImage[];
  poll: Poll | undefined;
  replies: Post[];
  scheduled: boolean;
  scheduledDate: Date | undefined;
  address?: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  audience: "EVERYONE" | "CIRCLE";
  replyRestriction: "EVERYONE" | "FOLLOW" | "CIRCLE" | "MENTION";
  token: string;
}

interface CreateReplyBody {
  reply: Reply;
  token: string;
}

interface CreatereplyWithMediaBody {
  author: User;
  originalPost: number;
  replyContent: string;
  images: File[];
  scheduled: boolean;
  scheduledDate: Date | undefined;
  poll: Poll | undefined;
  token: string;
}

// repost, like, stars,..
interface PostActionBody {
  postId: number;
  token: string;
}

interface CreatePostWithMediaBody extends createPostBody {
  imageFiles: File[];
}

interface UpdatePollPayload {
  index: number;
  choiceText: string;
}

interface BatchedPostViewsBody {
  ids: number[];
  token: string;
}

export interface LocationDetail {
  address: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
}

const initialState: PostSliceState = {
  loading: false,
  error: false,
  currentPost: undefined,
  currentPostImages: [],
  currentReplyImages: [],
  currentReply: undefined,
  batchedViews: [],
};

const baseUrl = process.env.REACT_APP_API_URL;

export const createPost = createAsyncThunk(
  "post/create",
  async (body: createPostBody, thunkAPI) => {
    try {
      let post = {
        content: body.content,
        author: body.author,
        images: body.images,
        poll: body.poll,
        replies: [],
        scheduled: body.scheduled,
        scheduledDate: body.scheduledDate,
        address: body.address,
        provinceCode: body.provinceCode,
        districtCode: body.districtCode,
        wardCode: body.wardCode,
        audience: body.audience,
        replyRestriction: body.replyRestriction,
      };

      // console.log("post created", post);

      const req = await axios.post(`${baseUrl}/posts`, post, {
        headers: { Authorization: `Bearer ${body.token}` },
      });

      const data = req.data;

      const newDate = new Date();

      thunkAPI.dispatch(
        setSessionTime(data.postedDate > newDate ? data.postedDate : newDate)
      );
      console.log("Time diff:");
      console.log("postedDate: ", data.postedDate);
      console.log("curr date: ", newDate);

      console.log(data.postedDate > newDate ? "hihi" : "huhu");

      return data;
    } catch (e) {
      thunkAPI.rejectWithValue(e);
    }
  }
);

export const createReply = createAsyncThunk(
  "post/reply",
  async (body: CreateReplyBody, thunkAPI) => {
    console.log("post created", body);
    let reply = {
      author: body.reply.author,
      originalPost: body.reply.originalPost.postId,
      replyContent: body.reply.replyContent,
      images: body.reply.images,
      scheduled: body.reply.scheduled,
      scheduledDate: body.reply.scheduledDate,
      poll: body.reply.poll,
    };
    try {
      const req = await axios.post(`${baseUrl}/posts/reply`, reply, {
        headers: { Authorization: `Bearer ${body.token}` },
      });

      thunkAPI.dispatch(setSessionTime(new Date()));

      const savedReply = req.data;
      let original = body.reply.originalPost;

      original = {
        ...original,
        replies: [...original.replies, savedReply],
      };

      thunkAPI.dispatch(updatePost(original));
      return savedReply;
    } catch (e) {
      thunkAPI.rejectWithValue(e);
    }
  }
);

export const createPostWithMedia = createAsyncThunk(
  "post/create-media",
  async (body: CreatePostWithMediaBody, thunkAPI) => {
    try {
      const images = body.imageFiles;

      let data = new FormData();

      let post = {
        content: body.content,
        author: body.author,
        replies: body.replies,
        scheduled: body.scheduled,
        scheduledDate: body.scheduledDate,
        address: body.address,
        provinceCode: body.provinceCode,
        districtCode: body.districtCode,
        wardCode: body.wardCode,
        audience: body.audience,
        replyRestriction: body.replyRestriction,
      };

      data.append("post", JSON.stringify(post));
      images.forEach((image) => data.append("files", image));

      let config = {
        method: "post",
        url: `${baseUrl}/posts/media`,
        headers: {
          Authorization: `Bearer ${body.token}`,
          "Content-Type": "multipart/form-data",
        },
        data,
      };

      let res = await axios(config);

      // thunkAPI.dispatch(setSessionTime(new Date()));
      thunkAPI.dispatch(
        setSessionTime(
          res.data.postedDate > new Date() ? res.data.postedDate : new Date()
        )
      );

      return res.data;
    } catch (e) {
      thunkAPI.rejectWithValue(e);
    }
  }
);

export const createReplyWithMedia = createAsyncThunk(
  "post/mediareply",
  async (body: CreatereplyWithMediaBody, thunkAPI) => {
    const images = body.images;

    let data = new FormData();

    let reply = {
      author: body.author,
      originalPost: body.originalPost,
      replyContent: body.replyContent,
      images: [],
      scheduled: body.scheduled,
      scheduledDate: body.scheduledDate,
      poll: body.poll,
    };

    data.append("reply", JSON.stringify(reply));

    images.forEach((image) => data.append("files", image));

    let config = {
      method: "post",
      url: `${baseUrl}/posts/reply/media`,
      headers: {
        Authorization: `Bearer ${body.token}`,
        "Content-Type": "multipart/form-data",
      },
      data,
    };

    try {
      let req = await axios(config);

      const savedReply = req.data;

      let original = savedReply?.replyTo;

      original = {
        ...original,
        replies: [...original.replies, savedReply],
      };
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const repostPost = createAsyncThunk(
  "post/repost",
  async (body: PostActionBody, thunkAPI) => {
    try {
      let req = await axios.put(
        `${baseUrl}/posts/repost/${body.postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${body.token}`,
          },
        }
      );

      let post = req.data;

      // thunkAPI.dispatch(updatePost(post));

      return post;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const likePost = createAsyncThunk(
  "post/like",
  async (body: PostActionBody, thunkAPI) => {
    try {
      let req = await axios.put(
        `${baseUrl}/posts/like/${body.postId}`,
        {},
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

export const starPost = createAsyncThunk(
  "post/star",
  async (body: PostActionBody, thunkAPI) => {
    try {
      // console.log("give start");
      let req = await axios.put(
        `${baseUrl}/posts/give-star/${body.postId}`,
        {},
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

export const viewPost = createAsyncThunk(
  "post/view",
  async (body: PostActionBody, thunkAPI) => {
    try {
      let req = await axios.put(
        `${baseUrl}/posts/view/${body.postId}`,
        {},
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

export const sendBatchedPostViews = createAsyncThunk(
  "post/batchedPostViews",
  async (body: BatchedPostViewsBody, thunkAPI) => {
    if (!body.ids || body.ids.length === 0) {
      return;
    }

    try {
      let ids = {
        ids: body.ids,
      };

      let req = await axios.put(`${baseUrl}/posts/view/all`, ids, {
        headers: {
          Authorization: `Bearer ${body.token}`,
        },
      });

      return req.data;
    } catch (e) {
      thunkAPI.rejectWithValue(e);
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/delete",
  async (body: PostActionBody, thunkAPI) => {
    try {
      let req = await axios.delete(`${baseUrl}/posts/${body.postId}`, {
        headers: {
          Authorization: `Bearer ${body.token}`,
        },
      });

      const result = req.data;
      thunkAPI.dispatch(
        setSessionTime(
          result.postedDate > new Date() ? result.postedDate : new Date()
        )
      );

      return result;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const PostSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    initializeCurrentPost(state, action: PayloadAction<Post>) {
      if (!state.currentPost) state.currentPost = action.payload;
      else {
        state = {
          ...state,
          currentPost: action.payload,
        };
      }

      return state;
    },

    initializeCurrentReply(state, action: PayloadAction<GenerateReplyPayload>) {
      state = {
        ...state,
        currentReply: {
          author: action.payload.user,
          originalPost: action.payload.post,
          replyContent: "",
          images: [],
          scheduled: false,
        },
      };

      return state;
    },

    updateCurrentPost(state, action: PayloadAction<updatePostPayload>) {
      if (state.currentPost) {
        state.currentPost = {
          ...state.currentPost,
          [action.payload.name]: action.payload.value,
        };
      } else if (state.currentReply) {
        state.currentReply = {
          ...state.currentReply,
          [action.payload.name]: action.payload.value,
        };
      }

      return state;
    },

    // updateCurrentReply(state, action: PayloadAction<updatePostPayload>) {
    //   if (state.currentReply) {
    //     state.currentReply = {
    //       ...state.currentReply,
    //       [action.payload.name]: action.payload.value,
    //     };
    //   }

    //   return state;
    // },

    updateCurrentPostImages(state, action: PayloadAction<File[]>) {
      if (state.currentPost) {
        state = {
          ...state,
          currentPostImages: action.payload,
        };
      } else if (state.currentReply) {
        state = {
          ...state,
          currentReplyImages: action.payload,
        };
      }

      return state;
    },

    createPoll(state) {
      let choices: PollChoice[] = [
        {
          pollChoiceId: 0,
          choiceText: "",
          votes: [],
        },
        {
          pollChoiceId: 0,
          choiceText: "",
          votes: [],
        },
      ];

      let poll: Poll = {
        pollId: 0,
        endTime: "1:0:0",
        choices,
      };

      if (state.currentPost) {
        let post = JSON.parse(JSON.stringify(state.currentPost));
        post = {
          ...post,
          poll,
        };

        state = {
          ...state,
          currentPost: post,
        };
      } else if (state.currentReply) {
        let reply = JSON.parse(JSON.stringify(state.currentReply));
        reply = {
          ...reply,
          poll,
        };
      }

      return state;
    },

    updatePoll(state, action: PayloadAction<UpdatePollPayload>) {
      if (state.currentPost && state.currentPost.poll) {
        let post = JSON.parse(JSON.stringify(state.currentPost));
        let poll = post.poll;
        let choices = poll.choices;

        if (choices.length - 1 < action.payload.index) {
          let choice: PollChoice = {
            pollChoiceId: 0,
            choiceText: action.payload.choiceText,
            votes: [],
          };

          choices[action.payload.index] = choice;
        } else {
          let choice: PollChoice = choices[action.payload.index];

          choice = {
            ...choice,
            choiceText: action.payload.choiceText,
          };

          choices[action.payload.index] = choice;
        }

        poll = {
          ...poll,
          choices,
        };

        post = {
          ...post,
          poll,
        };

        state = {
          ...state,
          currentPost: post,
        };

        // console.log("Choices: ", choices);
        // console.log("Poll: ", poll);
        // console.log("Current Post: ", post);
        // console.log("State: ", state);
      }

      return state;
    },

    removePoll(state) {
      if (state.currentPost && state.currentPost.poll) {
        let post = JSON.parse(JSON.stringify(state.currentPost));
        post = {
          ...post,
          poll: undefined,
        };

        state = {
          ...state,
          currentPost: post,
        };
      }

      return state;
    },

    setPollDate(state, action: PayloadAction<string>) {
      if (state.currentPost && state.currentPost.poll) {
        let post = JSON.parse(JSON.stringify(state.currentPost));
        let poll = post.poll;

        poll = {
          ...poll,
          endTime: action.payload,
        };

        post = {
          ...post,
          poll,
        };

        state = {
          ...state,
          currentPost: post,
        };
      } else if (state.currentReply && state.currentReply.poll) {
        let reply = JSON.parse(JSON.stringify(state.currentReply));
        let poll = reply.poll;

        poll = {
          ...poll,
          endTime: action.payload,
        };

        reply = {
          ...reply,
          poll,
        };

        state = {
          ...state,
          currentReply: reply,
        };
      }

      return state;
    },

    setScheduleDate(state, action: PayloadAction<Date>) {
      console.log("scheduled action!");
      if (state.currentPost) {
        let post: Post = JSON.parse(JSON.stringify(state.currentPost));

        post = {
          ...post,
          scheduledDate: action.payload,
          scheduled: true,
        };

        state = {
          ...state,
          currentPost: post,
        };
      } else if (state.currentReply) {
        let reply = JSON.parse(JSON.stringify(state.currentReply));

        reply = {
          ...reply,
          scheduledDate: action.payload,
          scheduled: true,
        };

        state = {
          ...state,
          currentReply: reply,
        };
      }

      return state;
    },

    setLocationDetail(state, action: PayloadAction<LocationDetail>) {
      if (state.currentPost) {
        let post = JSON.parse(JSON.stringify(state.currentPost));
        post = {
          ...post,
          address: action.payload.address,
          provinceCode: action.payload.provinceCode,
          districtCode: action.payload.districtCode,
          wardCode: action.payload.wardCode,
        };

        state.currentPost = post; // Cập nhật currentPost trực tiếp
      }

      console.log("state.currentPost: ", state.currentPost);

      return state;
    },

    batchPostView(state, action: PayloadAction<number>) {
      if (state.batchedViews.includes(action.payload)) return state;

      state = {
        ...state,
        batchedViews: [action.payload, ...state.batchedViews],
      };

      return state;
    },
    //
  },

  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state, action) => {
        state = {
          ...state,
          loading: true,
          // error: false,
        };
        return state;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        let post: Post = action.payload;

        state = {
          ...state,
          // posts: [post, ...state.posts];
          loading: false,
          error: false,
          currentPost: undefined,
        };
        return state;
      })
      .addCase(createPost.rejected, (state, action) => {
        state = {
          ...state,
          loading: false,
          error: true,
        };
        return state;
      });

    // create post with media
    builder
      .addCase(createPostWithMedia.pending, (state, action) => {
        state = {
          ...state,
          loading: true,
        };
        return state;
      })
      .addCase(createPostWithMedia.fulfilled, (state, action) => {
        let post: Post = action.payload;

        state = {
          ...state,
          loading: false,
          error: false,
          currentPost: undefined,
          currentPostImages: [],
        };
        return state;
      })
      .addCase(createPostWithMedia.rejected, (state, action) => {
        state = {
          ...state,
          loading: false,
          error: true,
        };
        return state;
      });

    // create reply in post
    builder
      .addCase(createReply.fulfilled, (state, action) => {
        state = {
          ...state,
          currentReply: undefined,
          loading: false,
          error: false,
          currentReplyImages: [],
        };

        return state;
      })
      .addCase(createReplyWithMedia.fulfilled, (state, action) => {
        state = {
          ...state,
          currentReply: undefined,
          loading: false,
          error: false,
          currentReplyImages: [],
        };
        return state;
      });

    // action with post (repost, like, star,...)
    builder
      .addCase(repostPost.fulfilled, (state, action) => {
        //TODO: setup so that it modifies the current feed in place
        state = {
          ...state,
          loading: false,
          error: false,
        };
        return state;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        //TODO: setup so that it modifies the current feed in place
        state = {
          ...state,
          loading: false,
          error: false,
        };
        return state;
      })
      .addCase(starPost.fulfilled, (state, action) => {
        //TODO: setup so that it modifies the current feed in place
        state = {
          ...state,
          loading: false,
          error: false,
        };
        return state;
      })
      .addCase(viewPost.pending, (state, action) => {
        state = {
          ...state,
          loading: true,
          error: false,
        };
        return state;
      })
      .addCase(viewPost.fulfilled, (state, action) => {
        state = {
          ...state,
          loading: false,
          error: false,
        };
        return state;
      })
      .addCase(viewPost.rejected, (state, action) => {
        state = {
          ...state,
          loading: false,
          error: true,
        };
        return state;
      });

    // batch views in post
    builder.addCase(sendBatchedPostViews.fulfilled, (state, action) => {
      state = {
        ...state,
        batchedViews: [],
      };
      return state;
    });

    // delete post
    // builder
    //   .addCase(deletePost.fulfilled, (state, action) => {
    //     state.posts = state.posts.filter(
    //       (post) => post.postId !== action.payload
    //     );
    //   });
  },
});

export const {
  initializeCurrentPost,
  updateCurrentPost,
  updateCurrentPostImages,
  createPoll,
  updatePoll,
  removePoll,
  setPollDate,
  setScheduleDate,
  setLocationDetail,
  initializeCurrentReply,
  // updateCurrentReply,
  batchPostView,
} = PostSlice.actions;
export default PostSlice.reducer;
