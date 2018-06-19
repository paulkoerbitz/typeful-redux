import 'mocha';
import { expect } from 'chai';
import { createReducer, createStore, createActionCreators, combineReducers, bindActionCreators } from '../src';

describe('createStore', () => {
    describe('created stores', () => {
        it('an empty store has a \'getState\', \'dispatch\' and \'subscribe\' method', () => {
            const store = createStore(createReducer(null, {}));

            expect(typeof store.getState).to.equal('function');
            expect(store.getState.length).to.equal(0);

            expect(typeof store.dispatch).to.equal('function');
            expect(store.dispatch.length).to.equal(1);

            expect(typeof store.subscribe).to.equal('function');
            expect(store.subscribe.length).to.equal(1);
        });

        it('a store with a single simple reducer reduces actions correctly', () => {
            const reducer = createReducer(0, {
                increment: (s: number) => s + 1,
                decrement: (s: number) => s - 1,
                set: (_s: number, newValue: number) => newValue
            });
            const store = createStore(reducer);

            expect(store.getState()).to.equal(0);

            store.dispatch({ type: "set", payload: 5 });
            expect(store.getState()).to.equal(5);

            store.dispatch({ type: "increment" });
            store.dispatch({ type: "increment" });
            expect(store.getState()).to.equal(7);

            store.dispatch({ type: "decrement" });
            store.dispatch({ type: "decrement" });
            store.dispatch({ type: "decrement" });
            expect(store.getState()).to.equal(4);

            store.dispatch({ type: "set", payload: -2 });
            expect(store.getState()).to.equal(-2);

        });

        it('a store with a single simple reducer and combineReducers reduces actions correctly', () => {
            const handlers = {
                increment: (s: number) => s + 1,
                decrement: (s: number) => s - 1,
                set: (_s: number, newValue: number) => newValue
            };
            const reducer = createReducer(0, handlers);
            const store = createStore(combineReducers({ counter: reducer }));

            expect(store.getState().counter).to.equal(0);

            const actionCreators = createActionCreators(handlers);
            const { increment, decrement, set } = bindActionCreators(actionCreators, store.dispatch);

            set(5);
            expect(store.getState().counter).to.equal(5);

            increment();
            increment();
            expect(store.getState().counter).to.equal(7);

            decrement();
            decrement();
            decrement();
            expect(store.getState().counter).to.equal(4);

            set(-2);
            expect(store.getState().counter).to.equal(-2);

        });
    });
});
