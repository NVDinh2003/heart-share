import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModalSliceState {
  displayEditPostImage: boolean;
  displayTagPeople: boolean;
  displayGif: boolean;
  displaySchedule: boolean;
  displayLocation: boolean;
  displayCreateReply: boolean;
  displayPostMore: boolean;
  displayMentionLearnMore: boolean;
  displayPostMention: boolean;
  displayCreateMessage: boolean;
  displayMessageGif: boolean;
  displayEditProfile: boolean;
}

const initialState: ModalSliceState = {
  displayEditPostImage: false,
  displayTagPeople: false,
  displayGif: false,
  displaySchedule: false,
  displayLocation: false,
  displayCreateReply: false,
  displayPostMore: false,
  displayMentionLearnMore: false,
  displayPostMention: false,
  displayCreateMessage: false,
  displayMessageGif: false,
  displayEditProfile: false,
};

export const ModalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    updateDisplayEditPostImage(state) {
      state = {
        ...state,
        displayEditPostImage: !state.displayEditPostImage,
      };
      return state;
    },

    updateDisplayTagPeople(state) {
      state = {
        ...state,
        displayTagPeople: !state.displayTagPeople,
      };
      return state;
    },

    updateDisplayGif(state) {
      state = {
        ...state,
        displayGif: !state.displayGif,
      };

      return state;
    },

    updateDisplaySchedule(state) {
      state = {
        ...state,
        displaySchedule: !state.displaySchedule,
      };

      return state;
    },

    updateDisplayLocation(state) {
      state = {
        ...state,
        displayLocation: !state.displayLocation,
      };
      return state;
    },

    updateDisplayCreateReply(state) {
      state = {
        ...state,
        displayCreateReply: !state.displayCreateReply,
      };
      return state;
    },

    updateDisplayPostMore(state) {
      state = {
        ...state,
        displayPostMore: !state.displayPostMore,
      };
      return state;
    },

    updateDisplayMentionLearnMore(state) {
      state = {
        ...state,
        displayMentionLearnMore: !state.displayMentionLearnMore,
      };

      return state;
    },

    updateDisplayPostMention(state, action: PayloadAction<boolean>) {
      state = {
        ...state,
        displayPostMention: action.payload,
      };

      return state;
    },

    updateDisplayCreateMessage(state) {
      state = {
        ...state,
        displayCreateMessage: !state.displayCreateMessage,
      };
      return state;
    },
    updateDisplayMessageGif(state) {
      state = {
        ...state,
        displayMessageGif: !state.displayMessageGif,
      };
      return state;
    },
    updateDisplayEditProfile(state) {
      state = {
        ...state,
        displayEditProfile: !state.displayEditProfile,
      };
      return state;
    },

    //
  },
});

export const {
  updateDisplayEditPostImage,
  updateDisplayTagPeople,
  updateDisplayGif,
  updateDisplaySchedule,
  updateDisplayLocation,
  updateDisplayCreateReply,
  updateDisplayPostMore,
  updateDisplayMentionLearnMore,
  updateDisplayPostMention,
  updateDisplayCreateMessage,
  updateDisplayMessageGif,
  updateDisplayEditProfile,
} = ModalSlice.actions;

export default ModalSlice.reducer;
