import * as tsa from "typesafe-actions";

export * from "typesafe-actions";

export const createStandardAction = new Proxy(tsa.createStandardAction, {
  apply(target, thisArg, argumentsList) {
    return target.apply(thisArg, check(argumentsList));
  }
});

export const createAction = new Proxy(tsa.createAction, {
  apply(target, thisArg, argumentsList) {
    return target.apply(thisArg, check([argumentsList[0]]));
  }
});

export const createAsyncAction = new Proxy(tsa.createAsyncAction, {
  apply(target, thisArg, argumentsList) {
    return target.apply(thisArg, check(argumentsList));
  }
});

export const createRequestAction = <
  RequestType extends string,
  SuccessType extends string,
  FailureType extends string
>(
  request: RequestType,
  success: SuccessType,
  failure: FailureType
) => <Body, Err = any>() => {
  return createAsyncAction<RequestType, SuccessType, FailureType>(
    request,
    success,
    failure
  )<
    {
      readonly type: "json" | "blob" | "text";
      readonly request: {
        readonly url: URL | string;
        readonly config?: RequestInit;
      };
      readonly resolvers?: Resolvers<Body, Err>;
    },
    {
      readonly response: Response;
      readonly body: Body;
    },
    {
      readonly response: Response;
      readonly error: Err;
    }
  >();
};

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

interface Resolvers<Body, Err> {
  readonly onSuccess?: (response: Response) => Body;
  readonly onFailure?: (response: Response) => Err;
}
