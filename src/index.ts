import { createStore, applyMiddleware, combineReducers } from 'redux';
import { connect as redux_connect } from 'react-redux';

export type Store<STATE, REDUCERS> = {
    getState(): STATE;
    dispatch: DispatchType<REDUCERS>;
    actionCreators: ActionCreatorsType<REDUCERS>;
    subscribe(cb: () => void): () => void;
    replaceReducer(reducer: any): void;
};

export type Action2Payload<NAME extends string, PAYLOAD> = {
    [name in NAME]: PAYLOAD
};

export type Dispatch0<NAME extends string> = {
    [name in NAME]: { (): void; }
};
export type Dispatch1<NAME extends string, PAYLOAD> = {
    [name in NAME]: { (payload: PAYLOAD): void; }
};

export type Remove<X extends string, Y extends string> =
    ({ [x in X]: x } & {[y in Y]: never } & { [x in string]: never })[X];

export type OmitKeys<X, K extends keyof X> =
    Pick<X, Remove<keyof X, K>>;

// type T0 = OmitKeys<{ a: number; b: string; c: number[]; }, 'a' | 'b'>;

export type ActionObject<Action, Payload> = {
    type: Action;
    payload: Payload;
};

export type ExtractPayload<F> =
    F extends (s: any, payload: infer P) => any ? P : never;

export type ActionNames<X extends Object> = keyof X;

export type DispatchArg<A2P extends Object> = {
    [ActionType in keyof A2P]: {
        type: ActionType;
        payload: ExtractPayload<A2P[ActionType]>
    };
}[keyof A2P];

export type ActionCreatorsType<Action2PayloadTypes extends Object> = {
    [ActionType in keyof Action2PayloadTypes]:
        (payload: ExtractPayload<Action2PayloadTypes[ActionType]>) => {
            type: ActionType;
            payload: ExtractPayload<Action2PayloadTypes[ActionType]>;
        };
};

export type DispatchObjectType<Action2PayloadTypes extends Object> = {
    [ActionType in keyof Action2PayloadTypes]:
        (payload: ExtractPayload<Action2PayloadTypes[ActionType]>) => void;
};

export type DispatchType<HANDLER> =
    ((action: DispatchArg<HANDLER>) => void) & DispatchObjectType<HANDLER>;

// type T1 = DispatchArg<{a: number; b: string; }>;
// type T2 = ActionCreators<{a: number; b: string; }>;
// type T3 = DispatchObject<{ a: number; b: string; }>;

// export type Omit<MAP extends Object, KEY extends keyof MAP> =
//     ({ [K in KEY]: never } & { [K in keyof MAP]: MAP[K] });

// type T0 = Omit<{ a: number; b: string; c: {} }, 'a'>;

// export type Reducer<REDUCER_STATE, REDUCER_DISPATCH = {}, ACTION2PAYLOAD extends {} = {}> = {
//     <REDUCER_NAME extends string>(
//         name: REDUCER_NAME,
//         handler: (state: REDUCER_STATE) => REDUCER_STATE
//     ): Reducer<
//         REDUCER_STATE,
//         REDUCER_DISPATCH & Dispatch0<REDUCER_NAME>,
//         ACTION2PAYLOAD & Action2Payload<REDUCER_NAME, void>
//     >;

//     <REDUCER_NAME extends string, PAYLOAD>(
//         name: REDUCER_NAME,
//         handler: (state: REDUCER_STATE, payload: PAYLOAD) => REDUCER_STATE
//     ): Reducer<
//         REDUCER_STATE,
//         REDUCER_DISPATCH & Dispatch1<REDUCER_NAME, PAYLOAD>,
//         ACTION2PAYLOAD & Action2Payload<REDUCER_NAME, PAYLOAD>
//     >;

//     addSetter<REDUCER_NAME extends string>(
//         name: REDUCER_NAME,
//         handler: (state: REDUCER_STATE) => REDUCER_STATE
//     ): Reducer<
//         REDUCER_STATE,
//         REDUCER_DISPATCH & Dispatch0<REDUCER_NAME>,
//         ACTION2PAYLOAD & Action2Payload<REDUCER_NAME, void>
//     >;

//     addHandler<REDUCER_NAME extends string, PAYLOAD>(
//         name: REDUCER_NAME,
//         handler: (state: REDUCER_STATE, payload: PAYLOAD) => REDUCER_STATE
//     ): Reducer<
//         REDUCER_STATE,
//         REDUCER_DISPATCH & Dispatch0<REDUCER_NAME>,
//         ACTION2PAYLOAD & Action2Payload<REDUCER_NAME, PAYLOAD>
//     >;

//     getInitial(): REDUCER_STATE;
//     getReducer(): any;
//     getActions(): Array<keyof ACTION2PAYLOAD>;
//     __dispatchType: REDUCER_DISPATCH;
// };

export type PayloadTypeForAction<NAME extends string, REDUCER> =
    REDUCER extends Reducer<any, infer HANDLER>
        ? HANDLER extends { [key in string]: any }
            ? HANDLER[NAME]
            : never
        : never;

export type StoreStateType<S> = S extends Store<infer X, any> ? X : never;
export type StoreDispatchType<S> = S extends Store<any, infer X> ? X : never;

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
            if (this.reducers.hasOwnProperty(key)) {
                result[key] = this.reducers[key].initialState;
            }
        }
        return result;
    }
    private buildReducers(): { reducers: any, actionCreators: any, dispatchFunctionsFactory: any } {
        let reducers: any = {};
        let actionCreators: any = {};
        for (const reducerName in this.reducers) {
            if (!this.reducers.hasOwnProperty(reducerName)) {
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
    <STATE, DISPATCH, OWN_PROPS extends { store: Store<STATE, DISPATCH>; }, PROPS_FROM_STATE, PROPS_FROM_DISPATCH>(
        mapStateToProps: MapStateToProps<STATE, OWN_PROPS, PROPS_FROM_STATE>,
        mapDispatchToProps: MapDispatchToProps<DISPATCH, OWN_PROPS, PROPS_FROM_DISPATCH>
    ): (component: React.ComponentClass<PROPS_FROM_STATE & PROPS_FROM_DISPATCH>) => React.ComponentClass<OWN_PROPS & { store: Store<STATE, DISPATCH>; }>;
}

export const connect: Connect = redux_connect;
