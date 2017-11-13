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
});