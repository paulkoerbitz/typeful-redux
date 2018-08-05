import { Arg1, Arg2 } from './type-helpers';
import { StoreEnhancer } from 'redux';

export type Reducer<State, Actions> = (state: State, action: Actions) => State;

export type ReducerMap = { [reducerName: string]: Reducer<any, any> };

export interface CombineReducers {
    <RM extends ReducerMap>(reducers: RM): Reducer<
        { [Name in keyof RM]: Arg1<RM[Name]> },
        { [Name in keyof RM]: Arg2<RM[Name]> }[keyof RM]
        >;
}

export type Store<State, Dispatch> = {
    getState(): State;
    dispatch: Dispatch;
    subscribe(cb: () => void): () => void;
    replaceReducer(reducer: any): void;
};

export interface CreateStore {
    <State, Actions>(
        reducer: Reducer<State, Actions>,
        initialState?: State,
        enhancer?: StoreEnhancer<State | null | undefined>
    ): Store<State, (action: Actions) => void>;
}

export type StoreState<STR extends Store<any, any>> = STR extends Store<
    infer State,
    any
    >
    ? State
    : never;

export interface MapStateToProps<STATE, OWN_PROPS, PROPS_FROM_STATE> {
    (state: STATE, ownProps: OWN_PROPS): PROPS_FROM_STATE;
}

export interface MapDispatchToProps<DISPATCH, OWN_PROPS, PROPS_FROM_DISPATCH> {
    (dispatch: DISPATCH, ownProps: OWN_PROPS): PROPS_FROM_DISPATCH;
}

export interface MergeProps<PROPS_FROM_STATE, PROPS_FROM_DISPATCH, OWN_PROPS, FINAL_PROPS> {
    (stateProps: PROPS_FROM_STATE, dispatchProps: PROPS_FROM_DISPATCH, ownProps: OWN_PROPS): FINAL_PROPS;
}

export interface Connect {
    <
        State,
        Dispatch,
        OwnProps,
        PropsFromState,
        PropsFromDispatch
        >(
        mapStateToProps: MapStateToProps<State, OwnProps, PropsFromState>,
        mapDispatchToProps: MapDispatchToProps<
            Dispatch,
            OwnProps,
            PropsFromDispatch
            >
    ): (
            component: React.ComponentClass<PropsFromState & PropsFromDispatch & OwnProps>
        ) => React.ComponentClass<OwnProps & { store: Store<State, Dispatch> }>;

    <
        State,
        Dispatch,
        OwnProps,
        PropsFromState,
        PropsFromDispatch,
        FinalProps
        >(
        mapStateToProps: MapStateToProps<State, OwnProps, PropsFromState>,
        mapDispatchToProps: MapDispatchToProps<
            Dispatch,
            OwnProps,
            PropsFromDispatch
            >,
        mergeProps: MergeProps<PropsFromState, PropsFromDispatch, OwnProps, FinalProps>
    ): (
            component: React.ComponentClass<FinalProps>
        ) => React.ComponentClass<OwnProps & { store: Store<State, Dispatch> }>;
}
