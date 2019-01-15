import * as React from "react";
// Import `inject` helper to connect react with redux state
import { inject } from "~/factory";
import { NewsItem } from "./NewsItem";
import { HackerNewsPost } from "./state/types";

// `inject` it's a just wrapper on the top of react-redux `connect` function
//
// `inject` automatically provides actions/selectors/extras
// all of them are not objects, but lazy functions and
// they accept appropriate actions/state/extras key ("news" here)
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
    // Note that `fetchNews` action produced with `createFetchAction`
    // and contains three actions: request, success, failure.
    // For automatic fetch lifecycle with redux middleware
    // `request` action should be dispatched
    fetchNews: actions("news").fetchNews.request
  }
}));

// We need to infer Props Type manually because TypeScript
// will not set React.Component<Props> generic type automatically.
// And @safenv/inject provides convinient `InjectedProps` type for that.
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
          // Without this handler response body will be passed to reducer as is
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
