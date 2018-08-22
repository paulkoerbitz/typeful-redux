import { createHandlerMap, createReducer, createStore, createActionCreators, combineReducers, bindActionCreators } from '..';

describe.skip('createStore', () => {
    describe('created stores', () => {
        it('an empty store has a \'getState\', \'dispatch\' and \'subscribe\' method', () => {
            const store = createStore(createReducer(createHandlerMap(null, {})));

            expect(typeof store.getState).toEqual('function');
            expect(store.getState.length).toEqual(0);

            expect(typeof store.dispatch).toEqual('function');
            expect(store.dispatch.length).toEqual(1);

            expect(typeof store.subscribe).toEqual('function');
            expect(store.subscribe.length).toEqual(1);
        });

        it('a store with a single simple reducer reduces actions correctly', () => {
            const reducer = createReducer(createHandlerMap(0, {
                increment: (s: number) => s + 1,
                decrement: (s: number) => s - 1,
                set: (_s: number, newValue: number) => newValue
            }));
            const store = createStore(reducer);

            expect(store.getState()).toEqual(0);

            store.dispatch({ type: "set", payload: 5 });
            expect(store.getState()).toEqual(5);

            store.dispatch({ type: "increment" });
            store.dispatch({ type: "increment" });
            expect(store.getState()).toEqual(7);

            store.dispatch({ type: "decrement" });
            store.dispatch({ type: "decrement" });
            store.dispatch({ type: "decrement" });
            expect(store.getState()).toEqual(4);

            store.dispatch({ type: "set", payload: -2 });
            expect(store.getState()).toEqual(-2);

        });

        it('a store with a single simple reducer and combineReducers reduces actions correctly', () => {
            const handlers = {
                increment: (s: number) => s + 1,
                decrement: (s: number) => s - 1,
                set: (_s: number, newValue: number) => newValue
            };
            const handlerMap = createHandlerMap(0, handlers)
            const reducer = createReducer(handlerMap);
            const store = createStore(combineReducers({ counter: reducer }));

            expect(store.getState().counter).toEqual(0);

            const actionCreators = createActionCreators(handlerMap);
            const { increment, decrement, set } = bindActionCreators(actionCreators, store.dispatch);

            set(5);
            expect(store.getState().counter).toEqual(5);

            increment();
            increment();
            expect(store.getState().counter).toEqual(7);

            decrement();
            decrement();
            decrement();
            expect(store.getState().counter).toEqual(4);

            set(-2);
            expect(store.getState().counter).toEqual(-2);

        });
    });
});
