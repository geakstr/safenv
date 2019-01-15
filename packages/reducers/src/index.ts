import { Provider } from "@safenv/di";
import produce, { Draft } from "immer";
import { ActionType, getType as typesafeGetType } from "typesafe-actions";

export const createReducerCreator = <Actions, Extras>(
  provider: Provider<any, Actions, any, Extras>
) => <State>(
  reducerCreator: ReducerCreator<State, Actions, Extras>,
  initialState?: State
) => {
  const reducer = reducerCreator({
    actions: provider.actions,
    extras: provider.extras,
    getType: typesafeGetType
  });
  return initialState ? produce(reducer, initialState) : produce(reducer);
};

export type ReducerCreator<State, Actions, Extras> = (
  args: {
    readonly actions: <K extends keyof Actions>(key: K) => Actions[K];
    readonly extras: () => Extras;
    readonly getType: typeof typesafeGetType;
  }
) => (draft: Draft<State>, action: ActionType<Actions>) => void | State;
