import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { actions } from "~/state/actions";
import { selectors } from "~/state/selectors";
import { createStore } from "~/state/store";
import { provider } from "./factory";
import "./styles.css";

provider.addActions(actions);
provider.addSelectors(selectors);
provider.setStore(createStore());

provider.run(async () => {
  const { App } = await import("~/modules/app/App");
  ReactDOM.render(
    <Provider store={provider.store()}>
      <App />
    </Provider>,
    document.getElementById("app")
  );
});
