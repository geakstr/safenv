import {
  createActionCreator,
  createAsyncActionCreator,
  createFetchActionCreator,
  createStandardActionCreator
} from "@safenv/actions";
import { createProvider } from "@safenv/di";
import { createInject } from "@safenv/inject";
import { createReducerCreator } from "@safenv/reducers";
import createCachedSelector from "re-reselect";
import { connect } from "react-redux";

export const provider = createProvider<
  import("./state/reducers").RootState,
  import("./state/actions").Actions,
  import("./state/selectors").Selectors,
  import("./state/extras").Extras
>();

export const inject = createInject(connect, provider);

export const createReducer = createReducerCreator(provider);

export const createAction = createActionCreator();
export const createStandardAction = createStandardActionCreator();
export const createAsyncAction = createAsyncActionCreator();
export const createFetchAction = createFetchActionCreator(createStandardAction);

export { createSelector } from "reselect";
export { createCachedSelector };
