import {
  createActionCreator,
  createAsyncActionCreator,
  createFetchActionCreator,
  createStandardActionCreator
} from "@safenv/actions";
import { createProvider } from "@safenv/di";
import { createInject } from "@safenv/inject";
import { createReducerCreator } from "@safenv/reducers";

export const createFactory = <RootState, Actions, Selectors, Extras>(
  connect: (...args: any[]) => any
) => {
  const provider = createProvider<RootState, Actions, Selectors, Extras>();

  const inject = createInject<
    typeof connect,
    RootState,
    Actions,
    Selectors,
    Extras
  >(connect, provider);

  const createReducer = createReducerCreator(provider);

  const createAction = createActionCreator();
  const createStandardAction = createStandardActionCreator();
  const createAsyncAction = createAsyncActionCreator();
  const createFetchAction = createFetchActionCreator(createStandardAction);

  return {
    provider,
    inject,
    createReducer,
    createAction,
    createStandardAction,
    createAsyncAction,
    createFetchAction
  };
};
