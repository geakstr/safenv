import { createFetch } from "@safenv/fetch";

export const createExtras = () => ({
  fetch: createFetch(window.fetch, {
    baseUrl: "https://hacker-news.firebaseio.com/v0/"
  })
});

export type Extras = ReturnType<typeof createExtras>;
