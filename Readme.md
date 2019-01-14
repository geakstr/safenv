### Installation

Tools provided by safenv are totally modular and you can use only things you need. With all features installation command looks like this:

```
npm install --save \
  @safenv/factory \
  @safenv/di \
  @safenv/actions \
  @safenv/reducers \
  @safenv/inject \
  @safenv/fetch \
  typesafe-actions \
  react-redux \
  redux \
  immer
```

### Getting Started

There are two parts in this manual: Preparation and Usage step. If you want to see these tools in action follow to Usage step.

#### Preparation Step

Let's see on <a href="https://github.com/geakstr/safenv/tree/master/example">project example</a>. It has the following structure:

```
./example
  package.json
  - src
    - modules
      - news
        News.tsx
        NewsItem.tsx
        - state
          actions.ts
          reducers.ts
          selectors.ts
          types.ts
    - state
        actions.ts
        extras.ts
        index.ts
        reducers.ts
        selectors.ts
        store.ts
      factory.ts
      index.tsx
```

First of all let's see on the top level `state/*`.

##### Reducers

`state/reducers.ts` contains creator function which returns root redux reducer and type of application root state. For now we don't have any reducers:

```ts
import { combineReducers } from "redux";

export const createRootReducer = () => {
  return combineReducers({});
};

export interface RootState {}
```

##### Actions

`state/actions.ts` contains creator function which returns combination of all actions within app and types of this combination as well. For now we don't have any actions (note `RootAction` type is created with `typesafe-action`):

```ts
import { ActionType } from "typesafe-actions";

export const createActions = () => ({});

export type Actions = ReturnType<typeof createActions>;
export type RootAction = ActionType<Actions>;
```

##### Selectors

`state/selectors.ts` contains creator function which returns combination of all selectors within app and types of this combination as well. For now we don't have any selectors:

```ts
export const createSelectors = () => ({});

export type Selectors = ReturnType<typeof createSelectors>;
```

##### Extras

`state/extras.ts` contains creator function which returns extra utilities or data you want to have across all the application. We want to add typesafe `@safenv/fetch` (it also provides interceptors and default config functionality) here:

```ts
import { createFetch } from "@safenv/fetch";

export const createExtras = () => ({
  fetch: createFetch(window.fetch, {
    baseUrl: "https://hacker-news.firebaseio.com/v0/"
  })
});

export type Extras = ReturnType<typeof createExtras>;
```

##### Factory

It's time to figure out what's the purpose of `factory.ts`. It creates typesafe binded utilities to work with application state (actions, selectors, reducers) and `inject` helper to connect react with redux. With these functions you almost don't need to write state related types manually when writing actual application related code.

```ts
import { createFactory } from "@safenv/factory";
import createCachedSelector from "re-reselect";
import { connect } from "react-redux";

export const {
  provider,
  inject,
  createReducer,
  createBasicReducer,
  createAction,
  createStandardAction,
  createAsyncAction,
  createFetchAction
} = createFactory<
  import("./state/reducers").RootState,
  import("./state/actions").Actions,
  import("./state/selectors").Selectors,
  import("./state/extras").Extras
>({ connect });

export { createSelector } from "reselect";
export { createCachedSelector };
```

**IMPORTANT.** Note `createFactory` function call. It accepts 4 generics: `RootState`, `Actions`, `Selectors` and `Extras` — types from your `./state/*`. _You should not import anything except types from `./state/*` here_.

Also note `provider` here. It's a global store which holds redux store and all your actions, selectors and extras. `provider` has lazy api, helps to avoid dependencies collisions (like cycles) and makes sure that all actions/selectors/extras are ready to use.

##### Store

Now we can touch redux store in `./state/store.ts`.

```ts
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
```

It creates redux store with root reducer from `./state/reducers.ts` and `createFetchActionMiddleware` which accepts our better `fetch` from extras and will do request actions lifecycle (request, success, response) for us automatically. Note `provider` and lazy `.extras()` getter call here.

##### Context

Latest thing in `./state` dir is `./state/index.ts`. It returns context creator function with all functionality we are implemented before:

```ts
import { createActions } from "~/state/actions";
import { createExtras } from "~/state/extras";
import { createSelectors } from "~/state/selectors";
import { createStore } from "~/state/store";

export const createContext = () => ({
  createActions,
  createSelectors,
  createStore,
  createExtras
});
```

##### Application Entry

Application entry placed in `index.tsx`.

```ts
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { provider } from "~/factory";
import { createContext } from "~/state";

const context = createContext();

provider.runWith(context, async () => {
  const { News } = await import("~/modules/news/News");
  ReactDOM.render(
    <Provider store={provider.store()}>
      <News />
    </Provider>,
    document.getElementById("app")
  );
});
```

We create the `context` here and use the `provider` from `factory.ts` to start application. **IMPORTANT**. Application Root Component (`<News />` here) should be imported and used only after `provider.runWith` called (in async way as in the example). Otherwise you can run across issues with not yet attached actions/selectors/extras. Perhaps there is a better way to do this and avoid the need in `provider.runWith`. This is the most important thing I don't like and I'm investigating in improvements here.

#### Usage Step

Phew. All preparations are done and we can write actual application related code. Keep calm, the better part comes.

Our example contains only one `modules/news` module. It has `state` directory with actions, reducers, selectors and types.

##### Types

Example uses <a href="https://github.com/HackerNews/API">HackerNews API</a>. `modules/news/types.ts` contains simple `HackerNewsPost` type to describe response body from API.

```ts
export interface HackerNewsPost {
  readonly id: string;
  readonly time: number;
  readonly title: string;
  readonly url: string;
}
```

##### Actions

`modules/news/actions.ts` contains all news module related actions. All actions use <a href="https://github.com/piotrwitek/typesafe-actions">typesafe-actions</a> under the hood.

```ts
import { createFetchAction } from "~/factory";
import { HackerNewsPost } from "./types";

export const fetchNews = createFetchAction(
  "fetch-news/request",
  "fetch-news/success",
  "fetch-news/failure"
)<HackerNewsPost[]>();
```

`createFetchAction` creator from our `factory.ts` is similar to `createAsyncAction` but with extra logic inside. We marked `fetchNews` action with `HackerNewsPost[]` type as response body.

##### Reducers

`modules/news/reducers.ts` contains all news module related reducer, but in most cases only single reducer should be exported.

```ts
import { createReducer } from "~/factory";
import { HackerNewsPost } from "./types";

export interface State {
  loading: boolean;
  news: HackerNewsPost[];
  error: string | null;
}

const initialState: State = {
  loading: false,
  news: [],
  error: null
};

export const reducer = createReducer(
  ({ actions, getType }) => (draft, action) => {
    switch (action.type) {
      case getType(actions("news").fetchNews.request): {
        draft.loading = true;
        break;
      }
      case getType(actions("news").fetchNews.success): {
        draft.loading = false;
        draft.news = action.payload.body;
        draft.error = null;
        break;
      }
      case getType(actions("news").fetchNews.failure): {
        draft.loading = false;
        const error = action.payload.error;
        const defaultError = "Something went wrong";
        draft.error = typeof error === "string" ? error : defaultError;
        break;
      }
    }
  },
  initialState
);
```

Note exported `State` type. All modules reducers should be described with some `State` type and export this type.

Next `createReducer` helper. First callback provides _all actions_ from _all modules_ to the reducer function. So you can react on other modules action here. Also it provides `getType` helper from typesafe-actions. Next callback is actual reducer body and this will be wrapped with <a href="https://github.com/mweststrate/immer">immer</a> (so you can create the next immutable state tree by simply modifying the current tree). If you don't want to use `immer` you can import and use `createBasicReducer` from factory insted.

Everytime you add module with actions/reducers/selectors you should add them to combined root state. Go to `./state/action
