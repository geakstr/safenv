import { InjectedProps } from "@safenv/inject";
import * as React from "react";
import { inject } from "~/factory";
import { NewsItem } from "./NewsItem";
import { HackerNewsPost } from "./state/types";

const injector = inject(({ actions, selectors }) => ({
  mapState: state => ({
    loading: selectors("news").getLoading(state),
    error: selectors("news").getError(state),
    newsIds: selectors("news").getNewsIds(state)
  }),
  mapActions: {
    fetchNews: actions("news").fetchNews.request
  }
}));

type Props = InjectedProps<typeof injector>;

export const News = injector(
  class NewsComponent extends React.Component<Props> {
    componentDidMount() {
      const baseUrl = "https://hacker-news.firebaseio.com/v0";
      this.props.fetchNews({
        format: "json",
        url: `${baseUrl}/topstories.json`,
        handlers: {
          onSuccess: async response => {
            const ids: string[] = await response.json();
            const promises = ids.slice(0, 10).map(id => {
              return new Promise<HackerNewsPost>((resolve, reject) => {
                fetch(`${baseUrl}/item/${id}.json`)
                  .then(response => resolve(response.json()))
                  .catch(reject);
              });
            });
            return await Promise.all(promises);
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
