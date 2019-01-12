import { ActionType } from "typesafe-actions";
import * as news from "~/modules/news/state/actions";

export const actions = {
  news
};

export type Actions = typeof actions;
export type RootAction = ActionType<Actions>;
