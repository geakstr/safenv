import { Provider } from "@safenv/di";
import {
  MapDispatchToPropsParam,
  MapStateToPropsParam,
  Options
} from "react-redux";
import { ActionCreatorsMapObject, bindActionCreators, Dispatch } from "redux";

export const createInject = <RootState, Actions, Selectors, Extras>(
  connect: (...args: any[]) => any,
  provider: Provider<RootState, Actions, Selectors, Extras>
) => <
  StateProps = {},
  DispatchProps extends ActionCreatorsMapObject = {},
  OwnProps = {}
>(
  injector: Injector<
    RootState,
    Actions,
    Selectors,
    Extras,
    StateProps,
    DispatchProps,
    OwnProps
  >
) => {
  const mappers = injector({
    actions: provider.actions,
    selectors: provider.selectors,
    extras: provider.extras
  });
  if (!mappers.mapState && !mappers.mapActions) {
    throw new Error("mapState or mapActions must be provided");
  }
  type WrappedComponent = React.ComponentType<OwnProps>;
  type ConnectedComponent = React.ComponentType<
    StateProps & DispatchProps & OwnProps
  >;
  const mapStateToProps = mappers.mapState ? mappers.mapState : null;
  const actionsMapper = mappers.mapActions
    ? mappers.mapActions
    : (dispatch: Dispatch, ownProps: OwnProps): DispatchProps => {
        return {} as DispatchProps;
      };
  const mapDispatchToProps: MapDispatchToPropsParam<DispatchProps, OwnProps> =
    actionsMapper instanceof Function
      ? actionsMapper
      : dispatch => bindActionCreators(actionsMapper, dispatch);
  if (mappers.options) {
    return connect(
      mapStateToProps,
      mapDispatchToProps,
      mappers.options
    ) as (Component: ConnectedComponent) => WrappedComponent;
  }
  return connect(
    mapStateToProps,
    mapDispatchToProps
  ) as (Component: ConnectedComponent) => WrappedComponent;
};

export type InjectedProps<
  T extends ReturnType<ReturnType<typeof createInject>>
> = ReactComponentProps<FirstArgument<T>>;

export interface ConnectMappers<
  RootState,
  StateProps,
  DispatchProps,
  OwnProps
> {
  readonly mapState?: MapStateToPropsParam<StateProps, OwnProps, RootState>;
  readonly mapActions?:
    | DispatchProps
    | MapDispatchToPropsParam<DispatchProps, OwnProps>;
  readonly options?: Options<RootState, StateProps, OwnProps, {}>;
}

export type Injector<
  RootState,
  Actions,
  Selectors,
  Extras,
  StateProps = {},
  DispatchProps extends ActionCreatorsMapObject = {},
  OwnProps = {}
> = (args: {
  actions(): Actions;
  selectors(): Selectors;
  extras: () => Extras;
}) => ConnectMappers<RootState, StateProps, DispatchProps, OwnProps>;

type FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any
  ? U
  : any;

type ReactComponentProps<T> = T extends React.ComponentType<infer X> ? X : null;
