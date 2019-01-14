import { createFactory } from "@safenv/factory";
import { connect } from "react-redux";

export const {
  provider,
  inject,
  createReducer,
  createBasicReducer,
  createAction,
  createStandardAction,
  createAsyncAction,
  createFetchAction,
  createSelector,
  createSelectorWithArgs,
  createMemoSelector,
  createMemoSelectorWithArgs
} = createFactory<
  import("./state/reducers").RootState,
  import("./state/actions").Actions,
  import("./state/selectors").Selectors,
  import("./state/extras").Extras
>({ connect });
