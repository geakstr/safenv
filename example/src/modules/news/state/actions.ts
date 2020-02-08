import { createFetchAction } from "~/factory";
import { HackerNewsPost } from "./types";

export const fetchNews = createFetchAction(
  "fetch-news/request",
  "fetch-news/success",
  "fetch-news/failure"
)<{ limit: number }, HackerNewsPost[]>(({ limit }, { extras }) => ({
  url: "/topstories.json",
  handlers: {
    onSuccess: async (response: Response) => {
      const ids: string[] = await response.json();
      const promises = ids.slice(0, limit).map(id => {
        return new Promise<HackerNewsPost>((resolve, reject) => {
          extras()
            .fetch.request<HackerNewsPost>(`/item/${id}.json`)
            .then(response => resolve(response.json()))
            .catch(reject);
        });
      });
      return Promise.all(promises);
    }
  }
}));
