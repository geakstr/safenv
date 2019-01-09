import produce, { Draft } from "immer";
import { ActionType, getType as typesafeGetType } from "./actions";

export const createReducerCreator = <Actions>(args: Args<Actions>) => <State>(
  provider: Provider<State, Actions>,
  initialState?: State
) => {
  const reducer = provider({ actions: args.actions, getType: typesafeGetType });
  return initialState ? produce(reducer, initialState) : produce(reducer);
};

type Provider<State, Actions> = (
  args: {
    readonly actions: Actions;
    readonly getType: typeof typesafeGetType;
  }
) => (draft: Draft<State>, action: ActionType<Actions>) => void | State;

interface Args<Actions> {
  readonly actions: Actions;
}
