import { ActionType } from "typesafe-actions";
import * as news from "~/modules/news/state/actions";

export const createActions = () => ({
  news
});

export type Actions = ReturnType<typeof createActions>;
export type RootAction = ActionType<Actions>;
