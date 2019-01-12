import { AnyAction, Store } from "redux";

export const createProvider = <RootState, Actions, Selectors, Extras>() => {
  const storage = {} as Storage<RootState, Actions, Selectors, Extras>;
  return {
    store() {
      return storage.store;
    },
    setStore(store) {
      storage.store = store;
    },
    actions(key) {
      return storage.actions[key];
    },
    addActions(actions) {
      storage.actions = {
        ...storage.actions,
        ...actions
      };
    },
    selectors(key) {
      return storage.selectors[key];
    },
    addSelectors(selectors) {
      storage.selectors = {
        ...storage.actions,
        ...selectors
      };
    },
    extras() {
      return storage.extras;
    },
    addExtras(extras) {
      storage.extras = {
        ...storage.extras,
        ...extras
      };
    },
    run(runner) {
      return new Promise<void>(() => runner());
    }
  } as Provider<RootState, Actions, Selectors, Extras>;
};

export interface Provider<RootState, Actions, Selectors, Extras> {
  store(): Store<RootState, AnyAction>;
  setStore(store: Store<RootState, AnyAction>): void;
  actions<K extends keyof Actions>(key: K): Actions[K];
  addActions(actions: Actions): void;
  selectors<K extends keyof Selectors>(key: K): Selectors[K];
  addSelectors(selectors: Selectors): void;
  extras(): Extras;
  addExtras(extras: Extras): void;
  run(runner: () => void): Promise<void>;
}

interface Storage<RootState, Actions, Selectors, Extras> {
  store: Store<RootState, AnyAction>;
  actions: Actions;
  selectors: Selectors;
  extras: Extras;
}
