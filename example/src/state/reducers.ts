import { combineReducers } from "redux";
import * as news from "~/modules/news/state/reducers";

export const createRootReducer = () => {
  return combineReducers({
    news: news.reducer
  });
};

export interface RootState {
  readonly news: import("../modules/news/state/reducers").State;
}
