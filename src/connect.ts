import * as Redux from 'redux';
import { connect as redux_connect } from 'react-redux';

export interface MapStateToProps<STATE, OWN_PROPS, PROPS_FROM_STATE> {
    (state: STATE, ownProps: OWN_PROPS): PROPS_FROM_STATE;
}

export interface MapDispatchToProps<DISPATCH, OWN_PROPS, PROPS_FROM_DISPATCH> {
    (dispatch: DISPATCH, ownProps: OWN_PROPS): PROPS_FROM_DISPATCH;
}

export interface MergeProps<
    PROPS_FROM_STATE,
    PROPS_FROM_DISPATCH,
    OWN_PROPS,
    FINAL_PROPS
> {
    (
        stateProps: PROPS_FROM_STATE,
        dispatchProps: PROPS_FROM_DISPATCH,
        ownProps: OWN_PROPS
    ): FINAL_PROPS;
}

export interface Connect {
    <
        State,
        Action extends Redux.Action,
        OwnProps,
        PropsFromState,
        PropsFromDispatch
    >(
        mapStateToProps: MapStateToProps<State, OwnProps, PropsFromState>,
        mapDispatchToProps: MapDispatchToProps<
            Redux.Dispatch<Action>,
            OwnProps,
            PropsFromDispatch
        >
    ): (
        component: React.ComponentClass<
            PropsFromState & PropsFromDispatch & OwnProps
        >
    ) => React.ComponentClass<OwnProps & { store: Store<State, Action> }>;

    <
        State,
        Action extends Redux.Action,
        OwnProps,
        PropsFromState,
        PropsFromDispatch,
        FinalProps
    >(
        mapStateToProps: MapStateToProps<State, OwnProps, PropsFromState>,
        mapDispatchToProps: MapDispatchToProps<
            Redux.Dispatch<Action>,
            OwnProps,
            PropsFromDispatch
        >,
        mergeProps: MergeProps<
            PropsFromState,
            PropsFromDispatch,
            OwnProps,
            FinalProps
        >
    ): (
        component: React.ComponentClass<FinalProps>
    ) => React.ComponentClass<OwnProps & { store: Store<State, Action> }>;
}

export const connect: Connect = redux_connect;
