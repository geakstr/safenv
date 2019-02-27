import * as React from "react";
// Import `inject` helper to connect react with redux state
import { inject } from "~/factory";
import { NewsItem } from "./NewsItem";

// `inject` it's a just wrapper on the top of react-redux `connect` function
//
// `inject` automatically provides actions/selectors/extras
// all of them are not objects, but lazy functions and
// they return actions/state/extras objects under keys ("news" here)
//
// `mapState` is react-redux `mapStateToProps`
// `mapActions` is almost the same react-redux `mapDispatchToProps`
const injector = inject(({ actions, selectors, extras }) => ({
  mapState: state => ({
    // as usual map state to props with selectors
    loading: selectors().news.getLoading(state),
    error: selectors().news.getError(state),
    newsIds: selectors().news.getNewsIds(state)
  }),
  mapActions: {
    // Note that `fetchNews` action produced with `createFetchAction`
    // and contains three actions: request, success, failure.
    // For automatic fetch lifecycle with redux middleware
    // `request` action should be dispatched
    fetchNews: actions().news.fetchNews.request
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
      // Request action mapped in `mapActions`
      this.props.fetchNews({ args: { limit: 10 } });
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
