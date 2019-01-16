import { createFetchAction } from "~/factory";
import { HackerNewsPost } from "./types";

export const fetchNews = createFetchAction(
  "fetch-news/request",
  "fetch-news/success",
  "fetch-news/failure"
)<{ limit: number }, HackerNewsPost[]>(({ limit }, { extras }) => ({
  // fetch instance from extras configured with baseUrl so only rest path needed
  url: "/topstories.json",

  // It's possible to intercept and modify response
  handlers: {
    // Without this handler response body will be passed to reducer as is
    onSuccess: async (response: Response) => {
      // Fetch data for every hackernews post id
      const ids: string[] = await response.json();
      const promises = ids.slice(0, limit).map(id => {
        return new Promise<HackerNewsPost>((resolve, reject) => {
          // this `fetch` comes from extras/
          // it's improved typesafe version of Fetch API.
          // HackerNewsPost used to type responsed json
          extras()
            .fetch.request<HackerNewsPost>(`/item/${id}.json`)
            .then(response => resolve(response.json()))
            .catch(reject);
        });
      });
      // Return array of fetched hacker news posts
      return Promise.all(promises);
    }
  }
}));
