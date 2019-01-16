import { Provider } from "@safenv/di";
import { TypedResponse } from "@safenv/fetch";
import * as deepmerge from "deepmerge";
import * as isPlainObject from "is-plain-object";
import { AnyAction, Dispatch, Store } from "redux";
import * as tsa from "typesafe-actions";

export const createStandardActionCreator = () => {
  return new Proxy(tsa.createStandardAction, {
    apply(target, thisArg, argumentsList) {
      return target.apply(thisArg, check(argumentsList));
    }
  });
};

export const createActionCreator = () => {
  return new Proxy(tsa.createAction, {
    apply(target, thisArg, argumentsList) {
      return target.apply(thisArg, check([argumentsList[0]]));
    }
  });
};

export const createAsyncActionCreator = () => {
  return new Proxy(tsa.createAsyncAction, {
    apply(target, thisArg, argumentsList) {
      return target.apply(thisArg, check(argumentsList));
    }
  });
};

export const createFetchActionCreator = <Extras>(
  provider: Provider<any, any, any, Extras>,
  createStandardAction: CreateStandardAction,
  argSkipMiddleware: boolean = false
) => {
  return <
    RequestType extends string,
    SuccessType extends string,
    FailureType extends string
  >(
    request: RequestType,
    success: SuccessType,
    failure: FailureType
  ) => <RequestArgs, Body>(
    requestPayloadCreator: (
      args: RequestArgs,
      provided: { readonly extras: () => Extras }
    ) => FetchRequestConfig & Handlers<Body>
  ) => {
    const successAction = createStandardAction(success).map(
      (
        payload: SuccessPayload<Body>,
        requestAction: RequestAction<Body, RequestArgs>
      ) => ({
        payload,
        meta: {
          marker: "@@safenv/fetch-action/success",
          requestAction
        }
      })
    );

    const failureAction = createStandardAction(failure).map(
      (
        payload: FailurePayload,
        requestAction: RequestAction<Body, RequestArgs>
      ) => ({
        payload,
        meta: {
          marker: "@@safenv/fetch-action/failure",
          requestAction
        }
      })
    );

    const requestAction = createStandardAction(request).map(
      (providedParams: {
        readonly args: FirstArgument<typeof requestPayloadCreator>;
        readonly extendRequest?: RequestPayload<Body>;
        readonly callbacks?: RequestCallbacks<Body>;
      }) => {
        const { args, extendRequest, callbacks } = providedParams;
        const payload = requestPayloadCreator(args, {
          extras: provider.extras
        });
        let finalPayload = payload;
        if (extendRequest) {
          finalPayload = deepmerge.all([payload, extendRequest], {
            isMergeableObject: isPlainObject,
            arrayMerge: (destinationArray, sourceArray, options) => sourceArray
          }) as RequestPayload<Body>;
        }
        if (!finalPayload.url) {
          throw new Error(`${request} action requires url`);
        }
        const {
          skipMiddleware = argSkipMiddleware,
          ...actualPayload
        } = finalPayload;
        return {
          payload: actualPayload,
          meta: {
            skipMiddleware,
            args,
            callbacks,
            marker: "@@safenv/fetch-action/request",
            success: successAction,
            failure: failureAction
          }
        };
      }
    );
    return {
      request: requestAction,
      success: successAction,
      failure: failureAction
    };
  };
};

export function markDispatched<
  T,
  Body,
  A extends { type: T; payload: FetchRequestConfig & Handlers<Body> }
>(something: A): RequestDispatchResult<Body> {
  return (something as any) as RequestDispatchResult<Body>;
}

export interface RequestDispatchResult<Body> {
  readonly type: string;
  readonly payload: FetchRequestConfig & Handlers<Body>;
  readonly cancel: () => void;
}

export const createFetchActionMiddleware = (
  fetchApi: (
    url: string,
    config?: RequestInit
  ) => Promise<Response | TypedResponse<any>>
) => <RootState>(store: Store<RootState, AnyAction>) => (next: Dispatch) => (
  action: AnyAction
): AnyAction | RequestDispatchResult<any> => {
  if (
    typeof action.meta !== "object" ||
    action.meta.marker !== "@@safenv/fetch-action/request"
  ) {
    return next(action);
  }
  if (action.meta.skipMiddleware) {
    return next(action);
  }
  let cancelled = false;
  const payload: FetchRequestConfig & Handlers<any> = action.payload;
  const { format = "json", url, handlers: resolvers } = payload;
  const controller = new AbortController();
  const config = {
    ...payload.config,
    signal: controller.signal
  };
  fetchApi(url, config)
    .then(response => {
      if (cancelled) return;
      if (response.ok) {
        let promise: Promise<any>;
        if (resolvers && resolvers.onSuccess) {
          promise = Promise.resolve(resolvers.onSuccess(response));
        } else {
          promise = response[format]();
        }
        return promise.then(body => {
          if (!cancelled) {
            const successPayload = { body, response };
            if (action.meta.callbacks && action.meta.callbacks.onSuccess) {
              action.meta.callbacks.onSuccess(successPayload);
            }
            store.dispatch(action.meta.success(successPayload, action));
          }
        });
      } else {
        let promise = Promise.resolve(response.statusText);
        if (resolvers && resolvers.onFailure) {
          promise = Promise.resolve(resolvers.onFailure(response));
        }
        return promise.then(error => {
          if (!cancelled) {
            const failurePayload = { error, response };
            if (action.meta.callbacks && action.meta.callbacks.onFailure) {
              action.meta.callbacks.onFailure(failurePayload);
            }
            store.dispatch(action.meta.failure(failurePayload, action));
          }
        });
      }
    })
    .catch(error => {
      if (cancelled) return;
      let errorPromise = Promise.resolve(error);
      if (!cancelled && resolvers && resolvers.onFailure) {
        errorPromise = Promise.resolve(resolvers.onFailure(error));
      }
      errorPromise.then(error => {
        if (!cancelled) {
          const failurePayload = { error };
          if (action.meta.callbacks && action.meta.callbacks.onFailure) {
            action.meta.callbacks.onFailure(failurePayload);
          }
          store.dispatch(action.meta.failure(failurePayload, action));
        }
      });
    });
  return next({
    ...action,
    cancel: () => {
      cancelled = true;
      controller.abort();
    }
  });
};

export interface FetchRequestConfig {
  readonly format?: "json" | "blob" | "text";
  readonly url?: string;
  readonly config?: RequestInit;
  readonly skipMiddleware?: boolean;
}

export interface Handlers<Body> {
  readonly handlers?: {
    readonly onSuccess?: (
      response: TypedResponse<Body>
    ) => Promise<Body> | Body;
    readonly onFailure?: (response: TypedResponse<any>) => Promise<any> | any;
  };
}

export interface SuccessPayload<Body> {
  readonly response: TypedResponse<Body>;
  readonly body: Body;
}

export interface FailurePayload {
  readonly response: Response;
  readonly error: any;
}

export interface CreateFetchActionCreatorOptions {
  readonly skipMiddleware?: boolean;
}

export interface RequestCallbacks<Body> {
  readonly onSuccess?: (body: Body) => void;
  readonly onFailure?: (error: any) => void;
}
export type RequestPayload<Body> = FetchRequestConfig & Handlers<Body>;
export interface RequestMeta<RequestArgs, RequestCallbacks> {
  skipMiddleware: boolean;
  args: RequestArgs;
  callbacks?: RequestCallbacks;
  marker: "@@safenv/fetch-action/request";
  success: (...args: any[]) => any;
  failure: (...args: any[]) => any;
}
export interface RequestAction<Body, RequestArgs> {
  readonly type: string;
  readonly payload: RequestPayload<Body>;
  readonly meta: RequestMeta<RequestArgs, RequestCallbacks<Body>>;
}

const cache: { [key: string]: boolean } = {};

const check = (types: string[]) => {
  types.forEach(type => {
    if (cache[type]) {
      throw new Error(`Action type "${type}" already used`);
    }
    cache[type] = true;
  });
  return types;
};

type CreateStandardAction = ReturnType<typeof createStandardActionCreator>;

type FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any
  ? U
  : any;
