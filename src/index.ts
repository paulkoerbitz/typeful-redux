import { createStore, applyMiddleware, combineReducers } from 'redux';
// import { connect as redux_connect } from 'react-redux';

// TODO
//  1. ~~~fix store type signature (right now only the first 'state' is available from 'getState')~~~
//  2. ~~~add 'get' method to return plain action object~~~
//  3. ~~~think about how to use this from mapDispatchToProps~~~
//     the question is: how can we declare that the dispatch function should fulfill a certain
//     typesig without depending on a store implementation.
//
//     OK, the way to do this is with a typeof hack - this is a bit unfortunate, but so be it
//     #6606 tracks 'typeof on any expression' which would solve this problem
//
//  6. ~~~cleanup names and definitions~~~
//  7. ~~~implement (?)~~~
//  9. ~~~adapt this use in sr-ui~~~
//
//  4. Implement type sig of connect function which requires / enables typesafe mapDispatchToProps
//     ---> OK, this is a bit of work, I'll do this after adapting it in sr-ui to have a real use case
//
//  8. Write draft of blog post
// 10. create library
// 11. write blog post
// 12. give talk(s)


export type BasicStore<S>  = {
    getState(): S;
    subscribe(cb: () => void): () => void;
}
export type Dispatch0<K extends string> = {
    [k in K]: { (): void; get(): { type: string } }
};
export type Dispatch<K extends string, P> = {
    [k in K]: { (x: P): void; get(payload: P): { type: string; payload: P } }
};
export type Handler0<S, K extends string> = {
    [k in K]: (x1: S) => void
};
export type Handler<S, K extends string, P> = {
    [k in K]: (x1: S, x2: P) => S
};

export class ReducerBuilder<S, X = {}, Y = {}> {
    private initial: S;
    private reducer: {};
    constructor(initial: S) {
        this.initial = initial;
        this.reducer = {};
    }
    public addSetter<K extends string>(name: K, handler: (state: S) => S): ReducerBuilder<S, X & Handler0<S, K>, Y & Dispatch0<K>> {
        const result = new ReducerBuilder<S, X & Handler0<S, K>, Y & Dispatch0<K>>(this.initial);
        result.reducer = { ...this.reducer, [name]: handler };
        return result;
    }
    public addHandler<K extends string, P>(name: K, handler: (state: S, payload: P) => S): ReducerBuilder<S, X & Handler<S, K, P>, Y & Dispatch<K, P>> {
        const result = new ReducerBuilder<S, X & Handler<S, K, P>, Y & Dispatch<K, P>>(this.initial);
        result.reducer = { ...this.reducer, [name]: handler };
        return result;
    }
    public getInitial(): S {
        return this.initial;
    }
    public getReducer(): X {
        return this.reducer as any;
    }
}

export class StoreBuilder<X = {}, Y = (action: { type: string; payload: any }) => void> {
    public addReducer<R extends string, S, XX, YY>(
        reducerName: R,
        reducerBuilder: ReducerBuilder<S, XX, YY>
    ): StoreBuilder<X & { [r in R]: S }, Y & { [r in R]: YY }> {
        const result = new StoreBuilder<X & { [r in R]: S }, Y & { [r in R]: YY }>();
        result.middlewares = this.middlewares;
        result.reducerBuilders = { ...this.reducerBuilders, [reducerName]: reducerBuilder };
        return result;
    }
    public addMiddleware(middleware: any): StoreBuilder<X, Y> {
        const result = new StoreBuilder<X, Y>();
        result.reducerBuilders = this.reducerBuilders;
        result.middlewares = [...this.middlewares, middleware];
        return result;
    }
    public build(): BasicStore<X> & { dispatch: Y } {
        const { reducers, dispatchFunctionsFactory } = this.buildReducers();
        const store = createStore(
            reducers,
            this.buildInitialState(),
            this.buildMiddleware()
        ) as any as BasicStore<X> & { dispatch: Y };
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

/*
interface UserInfo {
    username?: string;
    role?: string;
}

interface Template {
    foo: string;
}

// Do this with the real functions in user and template
const UserReducer = new ReducerBuilder({} as UserInfo)
    .addHandler(
        'login', (s) => ({})
    )
    .addHandler(
        'logout', (s) => ({username: undefined, role: undefined })
    )
    .addHandler(
        'start_login', (s: UserInfo, payload: UserInfo) => ({ ...payload })
    );

const TemplateReducer = new ReducerBuilder({ foo: "bar" } as Template)
    .addHandler(
        'reset', s => ({ foo: "bar" })
    )
    .addHandler(
        'add_element', (s: Template, payload: string) => ({ foo: payload })
    );

const store2 = new StoreBuilder()
    .addReducer('user', UserReducer)
    .addReducer('template', TemplateReducer)
    .addMiddleware({})
    .build();

const store3 = true ? undefined : new StoreBuilder()
    .addReducer('user', UserReducer)
    .addReducer('template', TemplateReducer)
    .build();

type UserTemplateStore = typeof store3;

type MyType = typeof store2;

let foo2: MyType = undefined as any;

foo2.dispatch.user.login({});
foo2.dispatch.user.start_login({ username: 'foo', role: 'bar' });

const s = store2.getState();
s.template.foo;
s.user.role;
s.user.username;

const add_element = store2.dispatch.template.add_element.get('foo');
store2.dispatch.user.login({});
store2.dispatch.template.add_element('foo');
store2.dispatch.template.reset({});

const foo = store2.dispatch.user.login.get({});
*/

/**
 * TODO: Safer connect wrapper
 * Should check that the state required by the mapStateToProps is acutally
 * available on the new props. Should also check that the functions needed on
 * the dispatch object are available on the store.
 *
 * @param mapStateToProps
 * @param mapDispatchToProps
 */
/*
export function connect<State, OldProps, NewProps>(
    return redux_connect(mapStateToProps, mapDispatchToProps)
    mapDispatchToProps: (dispatch: Dispatch, newProps: NewProps) => PropsFromDispatch
    //
    mapStateToProps: (state: State, newProps: NewProps) => PropsFromState,
//        /---> OK, this is a bit of work, I'll do this after adapting it in sr-ui to have a real use case
//
): (cc: React.ComponentClass<OldProps>) => ComponentClass<NewProps> {
}
    */

// const state = store.getState();
/*
store.dispatch.user.start_login({ username: "jon.doe", role: "admin" });
store.dispatch.user.logout();
store.dispatch.user.login();
store.dispatch.template.add_element("quox");
*/
