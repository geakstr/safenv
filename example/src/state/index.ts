import { createActions } from "~/state/actions";
import { createExtras } from "~/state/extras";
import { createSelectors } from "~/state/selectors";
import { createStore } from "~/state/store";

export const createContext = () => ({
  createActions,
  createSelectors,
  createStore,
  createExtras
});
