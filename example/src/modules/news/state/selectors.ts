import {
  createMemoSelector,
  createMemoSelectorWithArgs,
  createSelector,
  createSelectorWithArgs
} from "~/factory";

export const getLoading = createSelector(state => {
  return state.news.loading;
});

export const getError = createSelector(state => {
  return state.news.error;
});

export const getNews = createSelector(state => {
  return state.news.news;
});

export const getNewsIds = createMemoSelector(getNews, news =>
  news.map(item => item.id)
);

export const getNewsItemById = createMemoSelectorWithArgs(
  getNews,
  createSelectorWithArgs((_, id: string) => id),
  (news, id) => news.find(item => item.id === id)
)((_, id) => id);
