import { createStore as redux_createStore, StoreEnhancer } from 'redux';
import { connect as redux_connect } from 'react-redux';

export type Store<State, Dispatch> = {
    getState(): State;
    dispatch: Dispatch;
    subscribe(cb: () => void): () => void;
    replaceReducer(reducer: any): void;
};

export type HasArity2<F, THEN, ELSE> = ((
    x1: any,
    x2: any,
    ...xs: any[]
) => any) extends F
    ? THEN
    : ELSE;

export type Arg2<F> = HasArity2<
    F,
    F extends ((x1: any, x2: infer X2, ...xs: any[]) => any) ? X2 : never,
    never>;

export type DispatchArgFromHandler<Handler> = {
    [ActionType in keyof Handler]: Handler[ActionType] extends (
        s: any,
        payload: infer P
    ) => any
        ? { type: ActionType; payload: P }
        : { type: ActionType }
}[keyof Handler];

export type DispatchObjectFromHandler<Handler> = {
    [ActionType in keyof Handler]: HasArity2<
        Handler[ActionType],
        (payload: Arg2<Handler[ActionType]>) => void,
        () => void
    >
};

export type DispatchFromHandler<Handler> = ((
    action: DispatchArgFromHandler<Handler>
) => void) &
    DispatchObjectFromHandler<Handler>;

export type ActionCreatorsFromHandler<Handler> = {
    [ActionName in keyof Handler]: HasArity2<
        Handler[ActionName],
        (
            payload: Arg2<Handler[ActionName]>
        ) => { type: ActionName; payload: Arg2<Handler[ActionName]> },
        () => { type: ActionName }
    >
};

export type Reducer<State, Handler> = {
    initialState: State;
    handler: Handler;
};

export const createReducer = <State, Handler>(
    initialState: State,
    handler: Handler
): Reducer<State, Handler> => {
    return { initialState, handler };
};

export type GetKeys<U> = U extends Record<infer K, any> ? K : never;

export type UnionToIntersection<U> = {
    [K in GetKeys<U>]: U extends Record<K, infer T> ? T : never
};

export const combineReducers = <
    K extends { [reducerName: string]: Reducer<any, any> }
>(
    reducers: K
): Reducer<
    { [Name in keyof K]: K[Name]['initialState'] },
    UnionToIntersection<{ [Name in keyof K]: K[Name]['handler'] }[keyof K]>
> => {
    const result: any = {
        initialState: {},
        handler: {}
    };
    for (const key in reducers) {
        if (!reducers.hasOwnProperty(key)) {
            continue;
        }
        const { initialState, handler } = reducers[key];
        result.initialState[key] = initialState;
        result.handler = { ...result.handler, ...handler };
    }
    return result;
};

export const createStore = <State, Handler>(
    reducer: Reducer<State, Handler>,
    enhancer?: StoreEnhancer<State | null>
): Store<
    State,
    DispatchFromHandler<Handler>
> => {
    const store: Store<
        State,
        DispatchFromHandler<Handler>
    > = redux_createStore(reducer as any, null, enhancer) as any;
    const actionCreators = createActionCreators(reducer) as any;
    enhanceDispatch(store.dispatch, actionCreators);
    return store;
};

export const createActionCreators = <State, Handler>(
    reducer: Reducer<State, Handler>
): ActionCreatorsFromHandler<Handler> => {
    const result: any = {};
    for (const type in reducer.handler) {
        if (!reducer.handler.hasOwnProperty(type)) {
            continue;
        }
        result[type] = (payload: any) => ({ type, payload });
    }
    return result;
};

const enhanceDispatch = (dispatch: any, actionCreators: any) => {
    for (const key in actionCreators) {
        if (!actionCreators.hasOwnProperty(key)) {
            continue;
        }
        dispatch[key] = (payload: any) =>
            dispatch(actionCreators[key](payload));
    }
};

export interface MapStateToProps<STATE, OWN_PROPS, PROPS_FROM_STATE> {
    (state: STATE, ownProps: OWN_PROPS): PROPS_FROM_STATE;
}

export interface MapDispatchToProps<DISPATCH, OWN_PROPS, PROPS_FROM_DISPATCH> {
    (dispatch: DISPATCH, ownProps: OWN_PROPS): PROPS_FROM_DISPATCH;
}

export interface Connect {
    <
        State,
        Dispatch,
        OwnProps extends { store: Store<State, Dispatch> },
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
        component: React.ComponentClass<PropsFromState & PropsFromDispatch>
    ) => React.ComponentClass<OwnProps & { store: Store<State, Dispatch> }>;
}

export const connect: Connect = redux_connect;
