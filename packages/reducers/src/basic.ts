import { Provider } from "@safenv/di";
import { ActionType, getType as typesafeGetType } from "typesafe-actions";

export const createBasicReducerCreator = <Actions, Extras>(
  provider: Provider<any, Actions, any, Extras>
) => <State>(reducerCreator: ReducerCreator<State, Actions, Extras>) => {
  return reducerCreator({
    actions: provider.actions,
    extras: provider.extras,
    getType: typesafeGetType
  });
};

export type ReducerCreator<State, Actions, Extras> = (args: {
  readonly actions: () => Actions;
  readonly extras: () => Extras;
  readonly getType: typeof typesafeGetType;
}) => (state: State, action: ActionType<Actions>) => void | State;
