import { createReducer } from "~/factory";
import { HackerNewsPost } from "./types";

export interface State {
  readonly loading: boolean;
  readonly news: ReadonlyArray<HackerNewsPost>;
  readonly error: string | null;
}

const initialState: State = {
  loading: false,
  news: [],
  error: null
};

export const reducer = createReducer(
  ({ actions, getType }) => (draft, action) => {
    switch (action.type) {
      case getType(actions("news").fetchNews.request): {
        draft.loading = true;
        break;
      }
      case getType(actions("news").fetchNews.success): {
        draft.loading = false;
        draft.news = action.payload.body;
        draft.error = null;
        break;
      }
      case getType(actions("news").fetchNews.failure): {
        draft.loading = false;
        const error = action.payload.error;
        const defaultError = "Something went wrong";
        draft.error = typeof error === "string" ? error : defaultError;
        break;
      }
    }
  },
  initialState
);
