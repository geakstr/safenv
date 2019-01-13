import { createFactory } from "@safenv/factory";
import createCachedSelector from "re-reselect";
import { connect } from "react-redux";

export const {
  provider,
  inject,
  createReducer,
  createAction,
  createStandardAction,
  createAsyncAction,
  createFetchAction
} = createFactory<
  import("./state/reducers").RootState,
  import("./state/actions").Actions,
  import("./state/selectors").Selectors,
  import("./state/extras").Extras
>(connect);

export { createSelector } from "reselect";
export { createCachedSelector };
