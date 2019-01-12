import * as React from "react";
import { News } from "~/modules/news/News";

export const App = () => {
  return (
    <div className="app-wrapper">
      <h2>Top 10 Hacker News</h2>
      <News />
    </div>
  );
};
