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

export const createFactory = <RootState, Actions, Selectors, Extras>(
  options: CreateFactoryOptions
) => {
  const provider = createProvider<RootState, Actions, Selectors, Extras>();

  const inject = createInject<RootState, Actions, Selectors, Extras>(
    options.connect,
    provider
  );

  const createReducer = createReducerCreator(provider);

  const createAction = createActionCreator();
  const createStandardAction = createStandardActionCreator();
  const createAsyncAction = createAsyncActionCreator();
  const { skipFetchActionMiddleware = false } = options;
  const createFetchAction = createFetchActionCreator(
    createStandardAction,
    skipFetchActionMiddleware
  );

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

export interface CreateFactoryOptions {
  readonly connect: (...args: any[]) => any;
  readonly skipFetchActionMiddleware?: boolean;
}

type TypedResponseTypeRequire = TypedResponse<any>;
type ProviderTypeRequire = Provider<any, any, any, any>;
