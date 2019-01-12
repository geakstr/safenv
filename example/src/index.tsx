import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { provider } from "~/factory";
import { createContext } from "~/state";
import "~/styles.css";

const context = createContext();

provider.runWith(context, async () => {
  const { App } = await import("~/modules/app/App");
  ReactDOM.render(
    <Provider store={provider.store()}>
      <App />
    </Provider>,
    document.getElementById("app")
  );
});
