import { resolveTypes } from 'resolve-types';
import { createHandlerMap, createReducer } from '..';

describe('createReducer', () => {
    describe('returns a function that', () => {
        it('when passed undefined returns the initial state', () => {
            const initialState = { a_key: 'a value' };
            const handlerMap = createHandlerMap(initialState, {});
            const reducer = createReducer(handlerMap);
            const actual = reducer(undefined, {} as never);
            expect(actual).toEqual(initialState);
        });

        it('when passed an existing action invokes the associated handler', () => {
            const initialState = { a_key: 'a value' };
            const handlerMap = createHandlerMap(initialState, {
                my_action: (s: { a_key: string }, p: string) => {
                    expect(s.a_key).toEqual('value passed to reducer');
                    return { a_key: p };
                }
            });
            const reducer = createReducer(handlerMap);
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
            const reducer = createReducer(createHandlerMap(initialState, handlerMap));
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
            import { createReducer, createHandlerMap } from './src';
            const state = {};
            const handlerMap = createHandlerMap(state, {});
            const reducer = createReducer(handlerMap);
            type __reducerType = typeof reducer;
        `;

        it('has the right type', () => {
            expect(__reducerType).toEqual("(state: {}, action: never) => {}");
        });
    });
});
