import {
  createActionCreator,
  createAsyncActionCreator,
  createFetchActionCreator,
  createStandardActionCreator
} from "@safenv/actions";
import { createProvider, Provider } from "@safenv/di";
import { TypedResponse } from "@safenv/fetch";
import { createInject } from "@safenv/inject";
import { createReducerCreator } from "@safenv/reducers";
import { createBasicReducerCreator } from "@safenv/reducers/lib/basic";
import {
  createMemoSelectorCreator,
  createMemoSelectorWithArgsCreator,
  createSelectorCreator,
  createSelectorWithArgsCreator,
  RootSelector,
  RootSelectorWithArgs
} from "@safenv/selectors";
import { Draft, Immutable } from "immer";
import createMemoSelectorWithArgs from "re-reselect";
import { ActionCreatorsMapObject, AnyAction, Dispatch, Store } from "redux";
import { createSelector as createMemoSelector } from "reselect";
import * as tsa from "typesafe-actions";

export const createFactory = <RootState, Actions, Selectors, Extras>(
  options: CreateFactoryOptions
) => {
  const provider = createProvider<RootState, Actions, Selectors, Extras>();

  const inject = createInject<RootState, Actions, Selectors, Extras>(
    options.connect,
    provider
  );

  const createReducer = createReducerCreator(provider);
  const createBasicReducer = createBasicReducerCreator(provider);

  const createAction = createActionCreator();
  const createStandardAction = createStandardActionCreator();
  const createAsyncAction = createAsyncActionCreator();
  const { skipFetchActionMiddleware = false } = options;
  const createFetchAction = createFetchActionCreator(
    createStandardAction,
    skipFetchActionMiddleware
  );

  const createSelector = createSelectorCreator<RootState>();
  const createSelectorWithArgs = createSelectorWithArgsCreator<RootState>();
  const createMemoSelector = createMemoSelectorCreator();
  const createMemoSelectorWithArgs = createMemoSelectorWithArgsCreator();

  return {
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
  };
};

export interface CreateFactoryOptions {
  readonly connect: (...args: any[]) => any;
  readonly skipFetchActionMiddleware?: boolean;
}

// hacks to fix https://github.com/Microsoft/TypeScript/issues/26985
type TypedResponseTypeRequire = TypedResponse<any>;
type ProviderTypeRequire = Provider<any, any, any, any>;
type DraftRequire = Draft<any>;
type DispatchRequire = Dispatch;
type AnyActionRequire = AnyAction;
type StoreRequire = Store;
type ActionCreatorsMapObjectRequire = ActionCreatorsMapObject;
type ImmutableRequire = Immutable<any>;
type RootSelectorRequire = RootSelector<any, any>;
type RootSelectorWithArgsRequire = RootSelectorWithArgs<any, any, any>;
const tsaRequire = tsa;
const createMemoSelectorWithArgsRequire = createMemoSelectorWithArgs;
const createMemoSelectorRequire = createMemoSelector;
