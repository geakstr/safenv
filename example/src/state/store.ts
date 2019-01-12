import { createFetchActionMiddleware } from "@safenv/actions";
import { applyMiddleware, createStore as reduxCreateStore } from "redux";
import { provider } from "~/factory";
import { createRootReducer } from "./reducers";

export const createStore = () => {
  return reduxCreateStore(
    createRootReducer(),
    applyMiddleware(
      createFetchActionMiddleware(provider.extras().fetch.request)
    )
  );
};
