import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface ExploreSliceState {
  searchTerms: string;
}
const initialState: ExploreSliceState = {
  searchTerms: "",
};
export const ExploreSlice = createSlice({
  name: "explore",
  initialState,
  reducers: {
    setSearchTerms(state, action: PayloadAction<string>) {
      return {
        ...state,
        searchTerms: action.payload,
      };
    },
  },
});
export const { setSearchTerms } = ExploreSlice.actions;
export default ExploreSlice.reducer;
