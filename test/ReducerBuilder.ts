import 'mocha';
import { expect } from 'chai';
import { createReducer } from '../src';

describe('createReducer', () => {
    it('', () => {
        const initialState = { a_key: "a value" };
        const reducer = createReducer(initialState, {});
        expect(reducer).to.deep.equal(initialState);
    });

    it('getReducer() initially returns an empty map', () => {
        const reducer = createReducer(undefined);
        expect(reducer.getReducer()).to.deep.equal({});
    });

    it('addHandler() adds a handler to the reducer map', () => {
        const handler = (s: undefined, p: { foo: string }) => { p; return s; };
        const reducer = createReducer(undefined).addHandler('my_handler', handler);
        expect(reducer.getReducer()).to.deep.equal({ 'my_handler': handler });
    });

    it('__dispatchType has the right type', () => {
        interface S { foo: string; quox: number; };
        const setter = (s: S) => s;
        const handler1 = (s: S, p: { foo: string }) => { p; return s; };
        const handler2 = (s: S, p: { geez: string }) => { p; return s; };
        const reducer = createReducer({ foo: 'bar', quox: 3 })
            .addSetter('setter1', setter)
            ('setter2', setter)
            .addHandler('handler1', handler1)
            .addHandler('handler2', handler2)
            ('handler3', handler1)
            ('handler4', handler2)

        // if __dispatchType has the right type, these will not create type errors
        // the false && keeps this code from running (which would create a runtime error)
        false && reducer.__dispatchType.setter1();
        false && reducer.__dispatchType.setter2();
        false && reducer.__dispatchType.handler1({ foo: 'bar' });
        false && reducer.__dispatchType.handler2({ geez: 'bar' });
        false && reducer.__dispatchType.handler3({ foo: 'bar' });
        false && reducer.__dispatchType.handler4({ geez: 'bar' });
    });
});