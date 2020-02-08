import * as React from "react";
import { inject } from "~/factory";
import { NewsItem } from "./NewsItem";

const injector = inject(({ actions, selectors }) => ({
  mapState: state => ({
    loading: selectors().news.getLoading(state),
    error: selectors().news.getError(state),
    newsIds: selectors().news.getNewsIds(state)
  }),
  mapActions: {
    fetchNews: actions().news.fetchNews.request
  }
}));

type Props = import("@safenv/inject").InjectedProps<typeof injector>;

export const News = injector(
  class NewsComponent extends React.Component<Props> {
    componentDidMount() {
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
                <NewsItem id={id} key={id} />
              ))}
            </div>
          )}
        </div>
      );
    }
  }
);

type InjectedProps<HoC extends InjectorHoC> = ReactProps<FirstArg<HoC>>;

type InjectorHoC = ReturnType<typeof inject>;

type FirstArg<Fun> = Fun extends (a: infer Arg, ...args: any[]) => any
  ? Arg
  : any;

type ReactProps<Component> = Component extends React.ComponentType<infer Props>
  ? Props
  : null;
