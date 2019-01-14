import createMemoSelectorWithArgs from "re-reselect";
import {
  createSelector as createMemoSelector,
  ParametricSelector
} from "reselect";

export const createSelectorCreator = <RootState>() => {
  return <S extends ParametricSelector<RootState, P, R>, P, R>(selector: S) =>
    selector;
};

export const createMemoSelectorCreator = () => {
  return createMemoSelector;
};

export const createMemoSelectorWithArgsCreator = () => {
  return createMemoSelectorWithArgs;
};

export type RootSelector<S, R> = (state: S, ...args: any[]) => R;
