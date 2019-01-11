import produce, { Draft } from "immer";
import { ActionType, getType as typesafeGetType } from "typesafe-actions";
import { Provider } from "./provider";

export const createReducerCreator = <RootState, Actions, Selectors, Extras>(
  provider: Provider<RootState, Actions, Selectors, Extras>
) => <State>(
  reducerCreator: ReducerCreator<State, Actions>,
  initialState?: State
) => () => {
  const reducer = reducerCreator({
    actions: provider.actions,
    getType: typesafeGetType
  });
  return initialState ? produce(reducer, initialState) : produce(reducer);
};

type ReducerCreator<State, Actions> = (
  args: {
    readonly actions: <K extends keyof Actions>(key: K) => Actions[K];
    readonly getType: typeof typesafeGetType;
  }
) => (draft: Draft<State>, action: ActionType<Actions>) => void | State;
