import * as news from "~/modules/news/state/selectors";

export const createSelectors = () => ({
  news
});

export type Selectors = ReturnType<typeof createSelectors>;
