import * as React from "react";
import { inject } from "~/factory";
import { NewsItem } from "./NewsItem";
import { HackerNewsPost } from "./state/types";

const injector = inject(({ actions, selectors, extras }) => ({
  mapState: state => ({
    loading: selectors("news").getLoading(state),
    error: selectors("news").getError(state),
    newsIds: selectors("news").getNewsIds(state),
    fetch: extras().fetch
  }),
  mapActions: {
    fetchNews: actions("news").fetchNews.request
  }
}));

type Props = import("@safenv/inject").InjectedProps<typeof injector>;

export const News = injector(
  class NewsComponent extends React.Component<Props> {
    componentDidMount() {
      this.props.fetchNews({
        format: "json",
        url: "/topstories.json",
        handlers: {
          onSuccess: async response => {
            const ids = ((await response.json()) as any) as string[];
            const promises = ids.slice(0, 10).map(id => {
              return new Promise<HackerNewsPost>((resolve, reject) => {
                this.props.fetch
                  .request<HackerNewsPost>(`/item/${id}.json`)
                  .then(response => resolve(response.json()))
                  .catch(reject);
              });
            });
            return Promise.all(promises);
          }
        }
      });
    }
    render() {
      const { loading, error, newsIds } = this.props;
      if (loading) {
        return <div className="news-wrapper news-loading">Loading...</div>;
      }
      if (error) {
        return <div className="news-wrapper news-error">{error}</div>;
      }
      return (
        <div className="news-wrapper">
          {newsIds.map(id => (
            <NewsItem id={id} key={id} />
          ))}
        </div>
      );
    }
  }
);
