import 'mocha';
import { expect } from 'chai';
import { ReducerBuilder } from '../src';

describe('ReducerBuilder', () => {
    it('getInitial() returns the inital state', () => {
        const initialState = { a_key: "a value" };
        const reducer = new ReducerBuilder(initialState);
        expect(reducer.getInitial()).to.deep.equal(initialState);
    });

    it('getReducer() initially returns an empty map', () => {
        const reducer = new ReducerBuilder(undefined);
        expect(reducer.getReducer()).to.deep.equal({});
    });

    it('addHandler() adds a handler to the reducer map', () => {
        const handler = (s: undefined, p: { foo: string }) => { p; return s; };
        const reducer = new ReducerBuilder(undefined).addHandler('my_handler', handler);
        expect(reducer.getReducer()).to.deep.equal({ 'my_handler': handler });
    });

    it('__dispatchType has the right type', () => {
        interface S { foo: string; quox: number; };
        const setter = (s: S) => s;
        const handler1 = (s: S, p: { foo: string }) => { p; return s; };
        const handler2 = (s: S, p: { geez: string }) => { p; return s; };
        const reducer = new ReducerBuilder({ foo: 'bar', quox: 3 })
            .addSetter('setter', setter)
            .addHandler('handler1', handler1)
            .addHandler('handler2', handler2);

        // if __dispatchType has the right type, these will not create type errors
        // the false && keeps this code from running (which would create a runtime error)
        false && reducer.__dispatchType.setter();
        false && reducer.__dispatchType.handler1({ foo: 'bar' });
        false && reducer.__dispatchType.handler2({ geez: 'bar' });
    });
});