import { createFetchAction } from "~/factory";
import { HackerNewsPost } from "./types";

export const fetchNews = createFetchAction(
  "fetch-news/request",
  "fetch-news/success",
  "fetch-news/failure"
)<HackerNewsPost[], string>();
