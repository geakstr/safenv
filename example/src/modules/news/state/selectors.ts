import { createCachedSelector, createSelector } from "~/factory";
import { RootState } from "~/state/reducers";

export const getLoading = (state: RootState) => {
  return state.news.loading;
};

export const getError = (state: RootState) => {
  return state.news.error;
};

export const getNews = (state: RootState) => {
  return state.news.news;
};

export const getNewsIds = createSelector(
  getNews,
  news => news.map(item => item.id)
);

export const getNewsItemById = createCachedSelector(
  getNews,
  (_: RootState, id: string) => id,
  (news, id) => news.find(item => item.id === id)
)((_, id) => id);
