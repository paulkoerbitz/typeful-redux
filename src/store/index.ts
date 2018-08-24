import * as Redux from 'redux';
import * as Thunk from 'redux-thunk';
import { Action, Dispatch, ApplyMiddleware } from '../types/redux';
import { Reducer } from '../reducer';

/**
 * Function to remove listener added by `Store.subscribe()`.
 */
export interface Unsubscribe {
    (): void;
}

/**
 * A store is an object that holds the application's state tree.
 * There should only be a single store in a Redux app, as the composition
 * happens on the reducer level.
 *
 * @template S The type of state held by this store.
 * @template A the type of actions which may be dispatched by this store.
 */
export interface Store<
    S,
    A extends Action,
    D extends Dispatch<A> = Dispatch<A>
> {
    dispatch: D;
    getState(): S;
    subscribe(listener: () => void): Unsubscribe;
    replaceReducer(nextReducer: Reducer<S, A>): void;
}

export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

/**
 * A store creator is a function that creates a Redux store. Like with
 * dispatching function, we must distinguish the base store creator,
 * `createStore(reducer, preloadedState)` exported from the Redux package, from
 * store creators that are returned from the store enhancers.
 *
 * @template S The type of state to be held by the store.
 * @template A The type of actions which may be dispatched.
 * @template Ext Store extension that is mixed in to the Store type.
 * @template StateExt State extension that is mixed into the state type.
 */
export type StoreCreator<
    S,
    A extends Action,
    D extends Dispatch<A> = Dispatch<Action>
> = (reducer: Reducer<S, A>, preloadedState?: DeepPartial<S>) => Store<S, A, D>;

export type ConcreteStoreCreator = <
    S,
    A extends Action,
    D extends Dispatch<Action> = Dispatch<Action>
>(
    reducer: Reducer<S, A>,
    preloadedState?: DeepPartial<S>
) => Store<S, A, D>;
// <S, A extends actionCreators, D extends Dispatch<Action> = Dispatch<Action>>(GenericStoreCreator<S, A, D>

export const createStore = Redux.createStore as ConcreteStoreCreator;

export type StoreEnhancer<
    S,
    A extends Action,
    D extends Dispatch<A>,
    D2 extends Dispatch<A>
> = (storeCreator: StoreCreator<S, A, D>) => StoreCreator<S, A, D2>;

export interface MiddlewareAPI<D extends Dispatch<any>, S> {
    dispatch: D;
    getState(): S;
}

export interface Middleware<
    S,
    A extends Action,
    D extends Dispatch<A>,
    D2 extends Dispatch<A>
> {
    (api: MiddlewareAPI<D, S>): (next: D) => D2;
}

export interface ApplyMiddleware {
    // (): StoreEnhancer;
    <S, A extends Action, D extends Dispatch<A>, D2 extends Dispatch<A>>(
        middleware1: Middleware<S, A, D, D2>
    ): StoreEnhancer<S, A, D, D2>;
    // <Ext1, Ext2, S>(
    //     middleware1: Middleware<Ext1, S, any>,
    //     middleware2: Middleware<Ext2, S, any>
    // ): StoreEnhancer<{ dispatch: Ext1 & Ext2 }>;
    // <Ext1, Ext2, Ext3, S>(
    //     middleware1: Middleware<Ext1, S, any>,
    //     middleware2: Middleware<Ext2, S, any>,
    //     middleware3: Middleware<Ext3, S, any>
    // ): StoreEnhancer<{ dispatch: Ext1 & Ext2 & Ext3 }>;
    // <Ext1, Ext2, Ext3, Ext4, S>(
    //     middleware1: Middleware<Ext1, S, any>,
    //     middleware2: Middleware<Ext2, S, any>,
    //     middleware3: Middleware<Ext3, S, any>,
    //     middleware4: Middleware<Ext4, S, any>
    // ): StoreEnhancer<{ dispatch: Ext1 & Ext2 & Ext3 & Ext4 }>;
    // <Ext1, Ext2, Ext3, Ext4, Ext5, S>(
    //     middleware1: Middleware<Ext1, S, any>,
    //     middleware2: Middleware<Ext2, S, any>,
    //     middleware3: Middleware<Ext3, S, any>,
    //     middleware4: Middleware<Ext4, S, any>,
    //     middleware5: Middleware<Ext5, S, any>
    // ): StoreEnhancer<{ dispatch: Ext1 & Ext2 & Ext3 & Ext4 & Ext5 }>;
    // <Ext, S = any>(...middlewares: Middleware<any, S, any>[]): StoreEnhancer<{
    //     dispatch: Ext;
    // }>;
}

export const applyMiddleware: ApplyMiddleware = Redux.applyMiddleware;

export type StoreState<STR extends Store<any, any>> = STR extends Store<
    infer State,
    any
>
    ? State
    : never;

export type StoreActions<STR extends Store<any, any>> = STR extends Store<
    any,
    infer Action
>
    ? Action
    : never;

export interface ThunkDispatch<S, E, A extends Action> {
    <T extends A>(action: T): T;
    <R>(asyncAction: ThunkAction<R, S, E, A>): R;
}

export type ThunkAction<R, S, E, A extends Action> = (
    dispatch: ThunkDispatch<S, E, A>,
    getState: () => S,
    extraArgument: E
) => R;

export interface ThunkMiddleware<S, A extends Action, E>
    extends Middleware<S, A, Dispatch<A>, ThunkDispatch<S, E, A>> {
    withExtraArgument<S, E, A extends Action>(
        extraArgument: E
    ): ThunkMiddleware<S, A, E>;
}

// export type ConcreteThunkMiddleware =

//     (api: MiddlewareAPI<D, S>): (
//         next: D
//     ) => D2    withExtraArgument<S, E, A extends Action>(extraArgument: E): ThunkMiddleware<S, A, E>;
//         Middleware
//     withExtraArgument<S, E, A extends Action>(extraArgument: E): ThunkMiddleware<S, A, E>;
// }

export const thunk = (Thunk.default as any) as {
    <S, A extends Action, D extends Dispatch<A>, D2 extends Dispatch<A>>(
        api: MiddlewareAPI<D, S>
    ): (next: D) => D2;
    withExtraArgument: <S, A extends Action, E>(
        extraArgument: E
    ) => ThunkMiddleware<S, A, E>;
};
