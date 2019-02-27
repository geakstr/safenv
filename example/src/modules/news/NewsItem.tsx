import * as React from "react";
import { inject } from "~/factory";

// Shortand `inject` usage with functional component
export const NewsItem = inject(({ selectors }) => ({
  mapState: (state, props: { id: string }) => ({
    // use cached selector with `id` as argument
    item: selectors().news.getNewsItemById(state, props.id)
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
