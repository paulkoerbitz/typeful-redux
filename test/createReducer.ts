// import 'mocha';
// import { expect } from 'chai';
import { resolveTypes } from 'resolve-types';
import { createReducer } from '../src';


describe('createReducer', () => {
    describe('returns a function that', () => {
        it('when passed undefined returns the initial state', () => {
            const initialState = { a_key: 'a value' };
            const reducer = createReducer(initialState, {});
            const actual = reducer(undefined, {} as never);
            expect(actual).toEqual(initialState);
        });

        it('when passed an existing action invokes the associated handler', () => {
            const initialState = { a_key: 'a value' };
            const handlerMap = {
                my_action: (s: { a_key: string }, p: string) => {
                    expect(s.a_key).toEqual('value passed to reducer');
                    return { a_key: p };
                }
            };
            const reducer = createReducer(initialState, handlerMap);
            const { a_key: actual } = reducer(
                { a_key: 'value passed to reducer' },
                { type: 'my_action', payload: 'expected return value' }
            );
            expect(actual).toEqual('expected return value');
        });

        it('when passed a non-existing action returns the passed-in state', () => {
            const initialState = { a_key: 'a value' };
            const handlerMap = {
                my_action: (s: { a_key: string }, p: string) => {
                    expect(s.a_key).toEqual('value passed to reducer');
                    return { a_key: p };
                }
            };
            const reducer = createReducer(initialState, handlerMap);
            const { a_key: actual } = reducer(
                { a_key: 'value passed to reducer' },
                {
                    type: 'unknown_action' as any,
                    payload: 'not-expected return value'
                }
            );
            expect(actual).toEqual('value passed to reducer');
        });
    });

    describe('infers the right types', () => {
        const { types: { __reducerType } } = resolveTypes`
            import { createReducer } from './src';
            const state = {};
            const handlerMap = {};
            const reducer = createReducer(state, handlerMap);
            type __reducerType = typeof reducer;
        `;

        it('has the right type', () => {
            expect(__reducerType).toEqual("(state: {}, action: never) => {}");
        });
    });
});
