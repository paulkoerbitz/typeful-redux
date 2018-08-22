import * as Redux from 'redux';

export type Store<State, Action extends Redux.Action> = Redux.Store<
    State,
    Action
>;

export type StoreCreator = Redux.StoreCreator;

export const createStore: StoreCreator = Redux.createStore;

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

