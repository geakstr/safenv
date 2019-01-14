import createMemoSelectorWithArgs from "re-reselect";
import { createSelector as createMemoSelector } from "reselect";

export const createSelectorCreator = <RootState>() => {
  return <R>(selector: RootSelector<RootState, R>) => selector;
};

export const createSelectorWithArgsCreator = <RootState>() => {
  return <R, P>(selector: RootSelectorWithArgs<RootState, R, P>) => selector;
};

export const createMemoSelectorCreator = () => {
  return createMemoSelector;
};

export const createMemoSelectorWithArgsCreator = () => {
  return createMemoSelectorWithArgs;
};

export type RootSelector<S, R> = (state: S) => R;
export type RootSelectorWithArgs<S, P, R> = (
  state: S,
  props: P,
  ...args: any[]
) => R;
