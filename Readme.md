**safenv** or safe environment — set of tools to improve Developer Expirience with TypeScript, Redux, React and related stuff. It provides convenient ways to build typesafe application with less pain.

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
  @safenv/selectors \
  typesafe-actions \
  react-redux \
  redux \
  immer \
  reselect \
  re-reselect
```

### Getting Started

There are two parts in this manual: Preparation and Usage step.

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
  createMemoSelector,
  createMemoSelectorWithArgs
} = createFactory<
  import("./state/reducers").RootState,
  import("./state/actions").Actions,
  import("./state/selectors").Selectors,
  import("./state/extras").Extras
>({ connect });
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

`modules/news/actions.ts` contains all news module related actions. All actions use great <a href="https://github.com/piotrwitek/typesafe-actions">typesafe-actions</a> under the hood.

```ts
import { createFetchAction } from "~/factory";
import { HackerNewsPost } from "./types";

export const fetchNews = createFetchAction(
  "fetch-news/request",
  "fetch-news/success",
  "fetch-news/failure"
)<HackerNewsPost[]>();
```

`createFetchAction` creator from our `factory.ts` is similar to `createAsyncAction` but with extra logic inside. We marked `fetchNews` action with `HackerNewsPost[]` type as response payload.

##### Reducers

`modules/news/reducers.ts` contains all news module related reducers. In most cases only single reducer should be exported.

```ts
import { createReducer } from "~/factory";
import { HackerNewsPost } from "./types";

export interface State {
  readonly loading: boolean;
  readonly news: ReadonlyArray<HackerNewsPost>;
  readonly error: string | null;
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

Next `createReducer` helper. First callback provides _all actions_ from _all modules_ to the reducer function. So you can react on other modules actions in each reducer. Also it provides `getType` helper from typesafe-actions. Next callback is actual reducer body and this will be wrapped with <a href="https://github.com/mweststrate/immer">immer</a> (so you can create the next immutable state tree by simply modifying the current tree). If you don't want to use `immer` import and use `createBasicReducer` instead.

Next the most interested part of reducers: with `getType` in `switch/case` `action` variable payload has right type in each cases. Big thanks to `typesafe-actions` again.

##### Selectors

`modules/news/selectors.ts` contains all news module related selectors. It uses great <a href="https://github.com/reduxjs/reselect">reselect</a> and <a href="https://github.com/toomuchdesign/re-reselect">re-reselect</a> ibraries.

```ts
import {
  createMemoSelector,
  createMemoSelectorWithArgs,
  createSelector
} from "~/factory";

export const getLoading = createSelector(state => {
  return state.news.loading;
});

export const getError = createSelector(state => {
  return state.news.error;
});

export const getNews = createSelector(state => {
  return state.news.news;
});

export const getNewsIds = createMemoSelector(getNews, news =>
  news.map(item => item.id)
);

export const getNewsItemById = createMemoSelectorWithArgs(
  getNews,
  createSelector((state, id: string) => id),
  (news, id) => news.find(item => item.id === id)
)((state, id) => id);
```

Note all the `state` args are properly typed with `RootState` type.

##### Attatch to root state

Now we should add new actions, reducer and selectors to the root of state.

Inside `state/actions.ts` add `news` actions:

```ts
import { ActionType } from "typesafe-actions";
import * as news from "~/modules/news/state/actions";

export const createActions = () => ({
  news
});

export type Actions = ReturnType<typeof createActions>;
export type RootAction = ActionType<Actions>;
```

Inside `state/reducers.ts` add `news` reducer and `State` type:

```ts
import { combineReducers } from "redux";
import * as news from "~/modules/news/state/reducers";

export const createRootReducer = () => {
  return combineReducers({
    news: news.reducer
  });
};

export interface RootState {
  readonly news: import("../modules/news/state/reducers").State;
}
```

Inside `state/selectors.ts` add `news` selectors:

```ts
import * as news from "~/modules/news/state/selectors";

export const createSelectors = () => ({
  news
});

export type Selectors = ReturnType<typeof createSelectors>;
```

I'm thinking about how to improve attaching experience. One thought about it - these files can be auto generated in compilation time.

##### Components

Now it's time to connect react component with redux state. `modules/news/News.tsx` component with comments:

```ts
import * as React from "react";
// Import `inject` helper to connect react with redux state
import { inject } from "~/factory";
import { NewsItem } from "./NewsItem";
import { HackerNewsPost } from "./state/types";

// `inject` it's a just wrapper on the top of react-redux `connect` function
//
// `inject` automatically provides actions/selectors/extras
// all of them are not objects, but lazy functions and
// they accept appropriate actions/state key ("news" here)
//
// `mapState` is react-redux `mapStateToProps`
// `mapActions` is almost the same react-redux `mapDispatchToProps`
const injector = inject(({ actions, selectors, extras }) => ({
  mapState: state => ({
    // as usual map state to props with selectors
    loading: selectors("news").getLoading(state),
    error: selectors("news").getError(state),
    newsIds: selectors("news").getNewsIds(state),
    // also it's possible to pass any extras here
    fetch: extras().fetch
  }),
  mapActions: {
    // Not that `fetchNews` action produced with `createFetchAction`
    // and contains three actions: request, success, failure.
    // For automatic fetch lifecycle with redux middleware
    // `request` action should be dispatched
    fetchNews: actions("news").fetchNews.request
  }
}));

// We need to infer Props Type manually because TypeScript
// will not set React.Component<Props> generic type automatically.
// @safenv/inject provides convinient `InjectedProps` type for that.
// It can be omitted with functional components though.
type Props = import("@safenv/inject").InjectedProps<typeof injector>;

// Wrap component with injector HOC as usual with react-redux `connect`
export const News = injector(
  class NewsComponent extends React.Component<Props> {
    componentDidMount() {
      // Use our request action mapped in `mapActions`
      this.props.fetchNews({
        // Fetch instance configured with `baseUrl` so only rest path needed
        url: "/topstories.json",
        handlers: {
          // It's possible to intercept and modify response here.
          // Without this handler response body will passed to reducer as is
          onSuccess: async (response: Response) => {
            // Fetch data for every hackernews post id
            const ids: string[] = await response.json();
            const promises = ids.slice(0, 10).map(id => {
              return new Promise<HackerNewsPost>((resolve, reject) => {
                // this `fetch` comes from extras/
                // it's improved typesafe version of Fetch API.
                // HackerNewsPost used to type responsed json
                this.props.fetch
                  .request<HackerNewsPost>(`/item/${id}.json`)
                  .then(response => resolve(response.json()))
                  .catch(reject);
              });
            });
            // Return array of fetched hacker news posts
            return Promise.all(promises);
          }
        }
      });
    }
    render() {
      const { loading, error, newsIds } = this.props;
      const ready = Boolean(!loading && !error);
      return (
        <div className="app-wrapper">
          <h2>Top 10 Hacker News</h2>
          {loading && (
            <div className="news-wrapper news-loading">Loading...</div>
          )}
          {error && <div className="news-wrapper news-error">{error}</div>}
          {ready && (
            <div className="news-wrapper">
              {newsIds.map(id => (
                // each post is NewsItem component
                <NewsItem id={id} key={id} />
              ))}
            </div>
          )}
        </div>
      );
    }
  }
);
```

And `modules/news/NewsItem.tsx`:

```ts
import * as React from "react";
import { inject } from "~/factory";

// Shortand `inject` usage with functional component
export const NewsItem = inject(({ selectors }) => ({
  mapState: (state, props: { id: string }) => ({
    // use cached selector with `id` as argument
    item: selectors("news").getNewsItemById(state, props.id)
  })
}))(props => {
  return (
    <div className="news-post">
      <h3>
        <a href={props.item.url}>{props.item.title}</a>
      </h3>
    </div>
  );
});
```

And that's it. It covers all main features of safenv.
