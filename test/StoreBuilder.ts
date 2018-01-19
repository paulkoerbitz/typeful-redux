import 'mocha';
import { expect } from 'chai';
import { createReducer, StoreBuilder } from '../src';

describe('StoreBuilder', () => {
    describe('created stores', () => {
        it('an empty store has a \'getState\', \'dispatch\' and \'subscribe\' method', () => {
            const store = new StoreBuilder().build();

            expect(typeof store.getState).to.equal('function');
            expect(store.getState.length).to.equal(0);

            expect(typeof store.dispatch).to.equal('function');
            expect(store.dispatch.length).to.equal(1);

            expect(typeof store.subscribe).to.equal('function');
            expect(store.subscribe.length).to.equal(1);
        });

        it('a store with a single simple reducer reduces actions correctly', () => {
            const reducer = createReducer(0)
                ('increment', (s: number) => s + 1)
                ('decrement', (s: number) => s - 1)
                ('set', (_s: number, newValue: number) => newValue);
            const store = new StoreBuilder().addReducer('counter', reducer).build();

            expect(store.getState().counter).to.equal(0);

            store.dispatch.counter.set(5);
            expect(store.getState().counter).to.equal(5);

            store.dispatch.counter.increment();
            store.dispatch.counter.increment();
            expect(store.getState().counter).to.equal(7);

            store.dispatch.counter.decrement();
            store.dispatch.counter.decrement();
            store.dispatch.counter.decrement();
            expect(store.getState().counter).to.equal(4);

            store.dispatch.counter.set(-2);
            expect(store.getState().counter).to.equal(-2);

        });
    });
});
