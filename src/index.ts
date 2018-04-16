import { createStore, applyMiddleware, combineReducers } from 'redux';
import { connect as redux_connect } from 'react-redux';

export type Store<STATE, REDUCERS> = {
    getState(): STATE;
    dispatch: DispatchType<REDUCERS>;
    actionCreators: ActionCreatorsType<REDUCERS>;
    subscribe(cb: () => void): () => void;
    replaceReducer(reducer: any): void;
};

export type StoreFromDispatch<STATE, DISPATCH> = {
    getState(): STATE;
    dispatch: DISPATCH;
    actionCreators: ActionCreatorsFromDispatch<DISPATCH>;
    subscribe(cb: () => void): () => void;
    replaceReducer(reducer: any): void;
};

export type ActionCreatorsFromDispatch<Dispatch> = {
    [ActionName in keyof Dispatch]: (payload: Arg1<Dispatch[ActionName]>) => {
        type: ActionName;
        payload: Arg1<Dispatch[ActionName]>
    };
};

export type Arg1<X> = X extends (y: infer Y) => any ? Y : never;

export type Action2Payload<NAME extends string, PAYLOAD> = {
    [name in NAME]: PAYLOAD
};

export type Dispatch0<NAME extends string> = {
    [name in NAME]: { (): void; }
};
export type Dispatch1<NAME extends string, PAYLOAD> = {
    [name in NAME]: { (payload: PAYLOAD): void; }
};

export type ActionObject<Action, Payload> = {
    type: Action;
    payload: Payload;
};

export type ActionNames<X> = keyof X;

export type DispatchArg<A2P> = {
    [ActionType in keyof A2P]: {
        type: ActionType;
        payload: ExtractPayload<A2P[ActionType]>
    };
}[keyof A2P];

export type ExtractPayload<F> =
    F extends (state: any, payload: infer P) => any ? P : never;

export type ActionCreatorsType<Action2PayloadTypes> = {
    [ActionType in keyof Action2PayloadTypes]:
        (payload: ExtractPayload<Action2PayloadTypes[ActionType]>) => {
            type: ActionType;
            payload: ExtractPayload<Action2PayloadTypes[ActionType]>;
        };
};

export type DispatchObjectType<Action2PayloadTypes> = {
    [ActionType in keyof Action2PayloadTypes]:
        (payload: ExtractPayload<Action2PayloadTypes[ActionType]>) => void;
};

export type DispatchType<HANDLER> =
    ((action: DispatchArg<HANDLER>) => void) & DispatchObjectType<HANDLER>;

export type PayloadTypeForAction<NAME extends string, REDUCER> =
    REDUCER extends Reducer<any, infer HANDLER>
        ? HANDLER extends { [key in string]: any }
            ? HANDLER[NAME]
            : never
        : never;

export type StoreStateType<S> = S extends Store<infer X, any> ? X : never;
export type StoreDispatchType<S> = S extends Store<any, infer X> ? DispatchType<X> : never;

export type Reducer<STATE, HANDLER> = {
    initialState: STATE;
    actionCreators: ActionCreatorsType<HANDLER>;
    handler: HANDLER;
};

export const createReducer = <STATE, HANDLER>(
    initialState: STATE,
    handler: HANDLER
): Reducer<STATE, HANDLER> => {
    const actionCreators = {} as ActionCreatorsType<HANDLER>;
    for (const type in handler) {
        const h = handler[type] as any;
        if (typeof h === 'function' && h.length === 2) {
            actionCreators[type] = (payload: ExtractPayload<HANDLER[typeof type]>) => ({
                type, payload
            });
        } else if (typeof h === 'function' && h.length === 1 || typeof h === 'string') {
            (actionCreators as any)[type] = () => ({ type });
        } else {
            throw new Error(
                `createReducer: Unexpected handler with key ${type}: value must be handler function or '${type}'`
            );
        }
    }
    return { initialState, actionCreators, handler };
};

export type HandlerType<R> =
    R extends Reducer<any, infer HANDLER> ? HANDLER : never;

export type CombineHandlerTypes<REDUCERS extends { [key: string]: Reducer<any, any> }> =
    { [key in keyof REDUCERS]: HandlerType<REDUCERS[key]> }[keyof REDUCERS]

export class StoreBuilder<STORE_STATE = {}, REDUCERS extends {} = {}> {
    public addReducer<REDUCER_NAME extends string, REDUCER_STATE, REDUCER_HANDLER>(
        reducerName: REDUCER_NAME,
        reducer: Reducer<REDUCER_STATE, REDUCER_HANDLER>
    ): StoreBuilder<
        STORE_STATE & {[reducerName in REDUCER_NAME]: REDUCER_STATE },
        REDUCERS & { [reducerName in REDUCER_NAME]: Reducer<REDUCER_STATE, REDUCER_HANDLER> }
    > {
        const result = new StoreBuilder<
            STORE_STATE & {[r in REDUCER_NAME]: REDUCER_STATE },
            REDUCERS &  {[r in REDUCER_NAME]: Reducer<REDUCER_STATE, REDUCER_HANDLER> }
        >();
        result.middlewares = this.middlewares;
        result.reducers = { ...(this.reducers as any), [reducerName]: reducer };
        return result;
    }
    public addMiddleware(middleware: any): StoreBuilder<STORE_STATE, REDUCERS> {
        const result = new StoreBuilder<STORE_STATE, REDUCERS>();
        result.reducers = this.reducers;
        result.middlewares = [...this.middlewares, middleware];
        return result;
    }
    public build(): Store<STORE_STATE, CombineHandlerTypes<REDUCERS>> {
        const { reducers, actionCreators, dispatchFunctionsFactory } = this.buildReducers();
        const store: Store<STORE_STATE, CombineHandlerTypes<REDUCERS>> = createStore(
            reducers,
            this.buildInitialState(),
            this.buildMiddleware()
        ) as any;
        (store as any).dispatch = dispatchFunctionsFactory(store);
        (store as any).actionCreators = actionCreators;
        return store;
    }

    private reducers: REDUCERS = {} as any;
    private middlewares: any[] = [];

    private buildMiddleware(): any {
        return applyMiddleware(...this.middlewares);
    }
    private buildInitialState(): STORE_STATE {
        const result: any = {};
        for (const key in this.reducers) {
            if ((this.reducers as any).hasOwnProperty(key)) {
                result[key] = this.reducers[key].initialState;
            }
        }
        return result;
    }
    private buildReducers(): { reducers: any, actionCreators: any, dispatchFunctionsFactory: any } {
        let reducers: any = {};
        let actionCreators: any = {};
        for (const reducerName in this.reducers) {
            if (!(this.reducers as any).hasOwnProperty(reducerName)) {
                continue;
            }
            const reducer = this.makeReducer(reducerName);
            reducers[reducerName] = reducer;
            actionCreators = {
                ...actionCreators,
                ...((this.reducers as any)[reducerName] as Reducer<any, any>).actionCreators
            };
        }
        const dispatchFunctionsFactory = (store: any) => {
            const result: any = store.dispatch;
            for (const prefix in actionCreators) {
                for (const actionName in actionCreators[prefix]) {
                    result[actionName] =
                        (payload: any) => store.dispatch(actionCreators[actionName](payload));
                }
            }
            return result;
        };
        reducers = Object.keys(reducers).length > 0 ? combineReducers(reducers) : (s: any) => s;
        return { reducers, actionCreators, dispatchFunctionsFactory };
    }
    private makeReducer(reducerName: string): any {
        const { handler, initialState } = (this.reducers as any)[reducerName] as Reducer<any, any>;
        const reducer = (state: any, action: any): any => {
            if (action.type in handler) {
                return handler[action.type](state, action.payload);
            }
            // We have to avoid returning undefined
            // redux checks against this initially (passing undefined),
            // so we can't just return the state as is.
            return state != undefined ? state : initialState;
        };
        return reducer;
    }
}

/**
 * strongly typed connect
 */
export interface MapStateToProps<STATE, OWN_PROPS, PROPS_FROM_STATE> {
    (state: STATE, ownProps: OWN_PROPS): PROPS_FROM_STATE;
}

export interface MapDispatchToProps<DISPATCH, OWN_PROPS, PROPS_FROM_DISPATCH> {
    (dispatch: DISPATCH, ownProps: OWN_PROPS): PROPS_FROM_DISPATCH;
}

export interface Connect {
    <STATE, DISPATCH, OWN_PROPS extends { store: StoreFromDispatch<STATE, DISPATCH>; }, PROPS_FROM_STATE, PROPS_FROM_DISPATCH>(
        mapStateToProps: MapStateToProps<STATE, OWN_PROPS, PROPS_FROM_STATE>,
        mapDispatchToProps: MapDispatchToProps<DISPATCH, OWN_PROPS, PROPS_FROM_DISPATCH>
    ): (component: React.ComponentClass<PROPS_FROM_STATE & PROPS_FROM_DISPATCH>) => React.ComponentClass<OWN_PROPS & { store: Store<STATE, DISPATCH>; }>;
}

export const connect: Connect = redux_connect;
