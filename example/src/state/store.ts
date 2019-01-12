import { createFetchActionMiddleware } from "@safenv/actions";
import { applyMiddleware, createStore as reduxCreateStore } from "redux";
import { createRootReducer } from "./reducers";

export const createStore = () => {
  return reduxCreateStore(
    createRootReducer(),
    applyMiddleware(createFetchActionMiddleware(window.fetch))
  );
};
