import { createStore, applyMiddleware, combineReducers } from 'redux';
import { connect as redux_connect } from 'react-redux';

export type Store<STATE, DISPATCH> = {
    getState(): STATE;
    subscribe(cb: () => void): () => void;
    dispatch: DISPATCH;
};

export type Dispatch0<NAME extends string> = {
    [name in NAME]: { (): void; }
};
export type Dispatch1<NAME extends string, PAYLOAD> = {
    [name in NAME]: { (payload: PAYLOAD): void; }
};

export type Reducer<REDUCER_STATE, REDUCER_DISPATCH = {}> = {
    <REDUCER_NAME extends string>(
        name: REDUCER_NAME,
        handler: (state: REDUCER_STATE) => REDUCER_STATE
    ): Reducer<REDUCER_STATE, REDUCER_DISPATCH & Dispatch0<REDUCER_NAME>>;

    <REDUCER_NAME extends string, PAYLOAD>(
        name: REDUCER_NAME,
        handler: (state: REDUCER_STATE, payload: PAYLOAD) => REDUCER_STATE
    ): Reducer<REDUCER_STATE, REDUCER_DISPATCH & Dispatch1<REDUCER_NAME, PAYLOAD>>;

    addSetter<REDUCER_NAME extends string>(
        name: REDUCER_NAME,
        handler: (state: REDUCER_STATE) => REDUCER_STATE
    ): Reducer<REDUCER_STATE, REDUCER_DISPATCH & Dispatch0<REDUCER_NAME>>;

    addHandler<REDUCER_NAME extends string, PAYLOAD>(
        name: REDUCER_NAME,
        handler: (state: REDUCER_STATE, payload: PAYLOAD) => REDUCER_STATE
    ): Reducer<REDUCER_STATE, REDUCER_DISPATCH & Dispatch1<REDUCER_NAME, PAYLOAD>>;

    getInitial(): REDUCER_STATE;
    getReducer(): any;
    __dispatchType: REDUCER_DISPATCH;
};

export const createReducer = <REDUCER_STATE>(initialState: REDUCER_STATE): Reducer<REDUCER_STATE> => {
    const reducer: { [key: string]: any } = {};
    const addHandler = (name: string, handler: (state: REDUCER_STATE, payload?: any) => any) => {
        reducer[name] = handler;
        return result;
    };
    const result = addHandler as any;
    result.addSetter = addHandler;
    result.addHandler = addHandler;
    result.getInitial = () => initialState;
    result.getReducer = () => reducer;
    return result;
};

export type DEFAULT_STORE_DISPATCH = (action: { type: string; payload: any }) => void;

export class StoreBuilder<STORE_STATE = {}, STORE_DISPATCH = DEFAULT_STORE_DISPATCH> {
    public addReducer<REDUCER_NAME extends string, REDUCER_STATE, REDUCER_DISPATCH>(
        reducerName: REDUCER_NAME,
        reducerBuilder: Reducer<REDUCER_STATE, REDUCER_DISPATCH>
    ): StoreBuilder<
        STORE_STATE & {[reducerName in REDUCER_NAME]: REDUCER_STATE },
        STORE_DISPATCH & {[reducerName in REDUCER_NAME]: REDUCER_DISPATCH }
    > {
        const result = new StoreBuilder<
            STORE_STATE & {[r in REDUCER_NAME]: REDUCER_STATE },
            STORE_DISPATCH & {[r in REDUCER_NAME]: REDUCER_DISPATCH }
            >();
        result.middlewares = this.middlewares;
        result.reducerBuilders = { ...this.reducerBuilders, [reducerName]: reducerBuilder };
        return result;
    }
    public addMiddleware(middleware: any): StoreBuilder<STORE_STATE, STORE_DISPATCH> {
        const result = new StoreBuilder<STORE_STATE, STORE_DISPATCH>();
        result.reducerBuilders = this.reducerBuilders;
        result.middlewares = [...this.middlewares, middleware];
        return result;
    }
    public build(): Store<STORE_STATE, STORE_DISPATCH> {
        const { reducers, dispatchFunctionsFactory } = this.buildReducers();
        const store = createStore(
            reducers,
            this.buildInitialState(),
            this.buildMiddleware()
        ) as any as Store<STORE_STATE, STORE_DISPATCH>;
        (store as any).dispatch = dispatchFunctionsFactory(store);
        return store;
    }

    private reducerBuilders: { [key: string]: any } = {};
    private middlewares: any[] = [];

    private buildMiddleware(): any {
        return applyMiddleware(...this.middlewares);
    }
    private make_reducer(prefix: string): any {
        const handlers: any = {};
        const reducer = (state: any, action: any): any => {
            if (action.type in handlers) {
                return handlers[action.type](state, action.payload);
            }
            // We have to avoid returning undefined
            // redux checks against this initially (passing undefined),
            // so we can't just return the state as is.
            return state != undefined ? state : this.reducerBuilders[prefix].getInitial();
        };
        (reducer as any).register_action = <T>(type: string, handler: any) => {
            const fulltype = prefix + "/" + type;
            handlers[fulltype] = handler;
            return StoreBuilder.make_action_creator<T>(fulltype);
        }
        return reducer as any;
    }
    private static make_action_creator<T>(type: string): any {
        const result = (payload: T): any => ({ type, payload });
        (result as any).type = type;
        return result as any;
    }
    private buildReducers(): { reducers: any, dispatchFunctionsFactory: any } {
        let reducers: any = {};
        const actionCreators: any = {};
        for (const prefix in this.reducerBuilders) {
            if (!this.reducerBuilders.hasOwnProperty(prefix)) {
                continue;
            }
            const reducer = this.make_reducer(prefix);
            reducers[prefix] = reducer;
            actionCreators[prefix] = {};

            // Build a map of action creators out of the handlers
            const handlers = this.reducerBuilders[prefix].getReducer();
            for (const action_name in handlers) {
                const handler = handlers[action_name];
                const actionCreator = reducer.register_action(
                    action_name,
                    handler
                );
                actionCreators[prefix][action_name] = actionCreator;
            }
        }
        const dispatchFunctionsFactory = (store: any) => {
            const result: any = store.dispatch;
            for (const prefix in actionCreators) {
                result[prefix] = {};
                for (const actionName in actionCreators[prefix]) {
                    result[prefix][actionName] =
                        (payload: any) => store.dispatch(actionCreators[prefix][actionName](payload));
                    result[prefix][actionName].get =
                        (payload: any) => ({ type: prefix + "/" + actionName, payload });
                }
            }
            return result;
        };
        reducers = Object.keys(reducers).length > 0 ? combineReducers(reducers) : (s: any) => s;
        return { reducers, dispatchFunctionsFactory };
    }
    private buildInitialState(): any {
        const result: any = {};
        for (const key in this.reducerBuilders) {
            if (this.reducerBuilders.hasOwnProperty(key)) {
                result[key] = this.reducerBuilders[key].initial;
            }
        }
        return result;
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
