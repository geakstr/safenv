import { Provider } from "@safenv/di";
import { ActionType, getType as typesafeGetType } from "typesafe-actions";

export const createBasicReducerCreator = <
  RootState,
  Actions,
  Selectors,
  Extras
>(
  provider: Provider<RootState, Actions, Selectors, Extras>
) => <State>(reducerCreator: ReducerCreator<State, Actions>) => {
  return reducerCreator({
    actions: provider.actions,
    getType: typesafeGetType
  });
};

export type ReducerCreator<State, Actions> = (
  args: {
    readonly actions: <K extends keyof Actions>(key: K) => Actions[K];
    readonly getType: typeof typesafeGetType;
  }
) => (state: State, action: ActionType<Actions>) => void | State;
