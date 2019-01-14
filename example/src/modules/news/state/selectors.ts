import {
  createMemoSelector,
  createMemoSelectorWithArgs,
  createSelector
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
  createSelector((state, id: string) => id),
  (news, id) => news.find(item => item.id === id)
)((state, id) => id);
