import 'mocha';
import { expect } from 'chai';
import { ReducerBuilder, StoreBuilder } from '../src';

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
            const reducer = new ReducerBuilder(0).addSetter(
                'increment', s => s + 1
            ).addSetter(
                'decrement', s => s - 1
            ).addHandler(
                'set', (_s, newValue: number) => newValue
            );
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

        it('actions have a type `prefix`/`action_name`', () => {
            const reducer = new ReducerBuilder(0).addSetter(
                'increment', s => s + 1
            ).addSetter(
                'decrement', s => s - 1
            );
            const store = new StoreBuilder().addReducer('counter', reducer).build();

            expect(store.dispatch.counter.increment.get().type).to.equal("counter/increment");
            expect(store.dispatch.counter.decrement.get().type).to.equal("counter/decrement");
        });
    });
});