import { AnyAction, Store } from "redux";

export const createProvider = <RootState, Actions, Selectors, Extras>() => {
  const storage = {} as Storage<RootState, Actions, Selectors, Extras>;
  return {
    store() {
      return storage.store;
    },
    actions() {
      return storage.actions;
    },
    selectors() {
      return storage.selectors;
    },
    extras() {
      return storage.extras;
    },
    runWith(
      {
        createStore,
        createActions,
        createSelectors,
        createExtras = () => undefined
      }: ProviderContext<RootState, Actions, Selectors, Extras>,
      runner
    ) {
      storage.actions = createActions();
      storage.selectors = createSelectors();
      storage.extras = createExtras();
      storage.store = createStore();
      return new Promise<void>(() => runner());
    }
  } as Provider<RootState, Actions, Selectors, Extras>;
};

export interface Provider<RootState, Actions, Selectors, Extras> {
  store(): Store<RootState, AnyAction>;
  actions(): Actions;
  selectors(): Selectors;
  extras(): Extras;
  runWith(
    ctx: ProviderContext<RootState, Actions, Selectors, Extras>,
    runner: () => void
  ): Promise<void>;
}

export interface Storage<RootState, Actions, Selectors, Extras> {
  store: Store<RootState, AnyAction>;
  actions: Actions;
  selectors: Selectors;
  extras: Extras;
}

export interface ProviderContext<RootState, Actions, Selectors, Extras> {
  readonly createStore: () => Store<RootState, AnyAction>;
  readonly createActions: () => Actions;
  readonly createSelectors: () => Selectors;
  readonly createExtras?: () => Extras;
}
