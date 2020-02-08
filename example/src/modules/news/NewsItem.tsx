import * as React from "react";
import { inject } from "~/factory";

export const NewsItem = inject(({ selectors }) => ({
  mapState: (state, props: { id: string }) => ({
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
