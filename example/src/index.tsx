import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { provider } from "~/factory";
import { createContext } from "~/state";
import "~/styles.css";

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
