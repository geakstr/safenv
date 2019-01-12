import { TypedResponse } from "@safenv/fetch";
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

export const createFetchActionCreator = (
  createStandardAction: CreateStandardAction
) => {
  return <
    RequestType extends string,
    SuccessType extends string,
    FailureType extends string
  >(
    request: RequestType,
    success: SuccessType,
    failure: FailureType
  ) => <Body, Err = any>() => {
    type RequestPayload = FetchRequestConfig & Handlers<Body, Err>;
    const successAction = createStandardAction(success).map(
      (payload: SuccessPayload<Body>, requestPayload: RequestPayload) => ({
        payload,
        meta: {
          marker: "@@safenv/fetch-action/success",
          request: requestPayload
        }
      })
    );
    const failureAction = createStandardAction(failure).map(
      (payload: FailurePayload<Err>, requestPayload: RequestPayload) => ({
        payload,
        meta: {
          marker: "@@safenv/fetch-action/failure",
          request: requestPayload
        }
      })
    );
    const requestAction = createStandardAction(request).map(
      (payload: RequestPayload) => ({
        payload,
        meta: ({
          marker: "@@safenv/fetch-action/request",
          success: successAction,
          failure: failureAction
        } as any) as undefined
      })
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
  Err,
  A extends { type: T; payload: FetchRequestConfig & Handlers<Body, Err> }
>(something: A): RequestDispatchResult<Body, Err> {
  return (something as any) as RequestDispatchResult<Body, Err>;
}

export interface RequestDispatchResult<Body, Err> {
  readonly type: string;
  readonly payload: FetchRequestConfig & Handlers<Body, Err>;
  readonly cancel: () => void;
}

export const createFetchActionMiddleware = (
  fetchApi: (
    url: string,
    config?: RequestInit
  ) => Promise<Response | TypedResponse<any>>
) => <RootState>(store: Store<RootState, AnyAction>) => (next: Dispatch) => (
  action: AnyAction
): AnyAction | RequestDispatchResult<any, any> => {
  if (
    typeof action.meta !== "object" ||
    action.meta.marker !== "@@safenv/fetch-action/request"
  ) {
    return next(action);
  }
  let cancelled = false;
  const payload: FetchRequestConfig & Handlers<any, any> = action.payload;
  const { format, url, handlers: resolvers } = payload;
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
            store.dispatch(action.meta.success({ body, response }, payload));
          }
        });
      } else {
        let promise = Promise.resolve(response.statusText);
        if (resolvers && resolvers.onFailure) {
          promise = Promise.resolve(resolvers.onFailure(response));
        }
        return promise.then(error => {
          if (!cancelled) {
            store.dispatch(action.meta.failure({ error, response }, payload));
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
          store.dispatch(
            action.meta.failure({ error, response: undefined }, payload)
          );
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
  readonly format: "json" | "blob" | "text";
  readonly url: string;
  readonly config?: RequestInit;
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

interface SuccessPayload<Body> {
  readonly response: Response;
  readonly body: Body;
}

interface FailurePayload<Err> {
  readonly response: Response;
  readonly error: Err;
}

interface Handlers<Body, Err> {
  readonly handlers?: {
    readonly onSuccess?: (
      response: TypedResponse<Body>
    ) => Promise<Body> | Body;
    readonly onFailure?: (response: TypedResponse<any>) => Promise<Err> | Err;
  };
}
