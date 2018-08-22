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
            const reducer = createReducer(
                createHandlerMap(initialState, handlerMap)
            );
            const { a_key: actual } = reducer(
                { a_key: 'value passed to reducer' },
                {
                    type: 'unknown_action' as any,
                    payload: 'not-expected return value'
                }
            );
            expect(actual).toEqual('value passed to reducer');
        });

        it('returns a full state even if a handler only provides a partial update', () => {
            const initialState = { a: 3, b: 'initial b' };
            const handlerMap = {
                foo: { b: 'b set by foo' }
            };
            const reducer = createReducer(
                createHandlerMap(initialState, handlerMap)
            );
            const newState = reducer(
                { a: 5, b: 'different b' },
                { type: 'foo' }
            );
            expect(newState).toEqual({ a: 5, b: 'b set by foo' });
        });

        it('correctly handles updates for handlers which are objects', () => {
            const initialState = { a: 3, b: 'initial b' };
            const handlerMap = {
                foo: { a: -3, b: 'b set by foo' }
            };
            const reducer = createReducer(
                createHandlerMap(initialState, handlerMap)
            );
            const newState = reducer(
                { a: 5, b: 'different b' },
                { type: 'foo' }
            );
            expect(newState).toEqual({ a: -3, b: 'b set by foo' });
        });

        it('correctly handles updates for handlers which are nullary functions', () => {
            const initialState = { a: 3, b: 'initial b' };
            const handlers = {
                foo: () => ({ a: -3, b: 'b set by foo' }),
                bar: () => ({ b: 'b set by bar' })
            };
            const handlerMap = createHandlerMap(initialState, handlers);
            const reducer = createReducer(handlerMap);

            const stateAfterFoo = reducer(
                { a: 5, b: 'different b' },
                { type: 'foo' }
            );
            expect(stateAfterFoo).toEqual({ a: -3, b: 'b set by foo' });

            const stateAfterBar = reducer(
                { a: 5, b: 'different b' },
                { type: 'bar' }
            );
            expect(stateAfterBar).toEqual({ a: 5, b: 'b set by bar' });
        });

        it('correctly handles updates for handlers which are unary functions', () => {
            const initialState = { a: 3, b: 'initial b' };
            const handlerMap = createHandlerMap(initialState, {
                foo: s => ({ a: s.a + 1, b: 'b set by foo' }),
                bar: s => ({ b: s.b + ' and bar!' })
            });
            const reducer = createReducer(handlerMap);

            const stateAfterFoo = reducer(
                { a: 5, b: 'different b' },
                { type: 'foo' }
            );
            expect(stateAfterFoo).toEqual({ a: 6, b: 'b set by foo' });

            const stateAfterBar = reducer(
                { a: 5, b: 'different b' },
                { type: 'bar' }
            );
            expect(stateAfterBar).toEqual({ a: 5, b: 'different b and bar!' });
        });

        it('correctly handles updates for handlers which are binary functions', () => {
            const initialState = { a: 3, b: 'initial b' };
            const handlerMap = {
                foo: (s, x: number) => ({ a: s.a > 3 ? x : 0 - x, b: 'b set by foo' }),
                bar: (s, x: string) => ({ b: s.a > 3 ? '> 3' + x : '<= 3' + x })
            };
            const reducer = createReducer(createHandlerMap(initialState, handlerMap));

            const stateAfterFoo = reducer(
                { a: 5, b: 'different b' },
                { type: 'foo', payload: 10 }
            );
            expect(stateAfterFoo).toEqual({ a: 10, b: 'b set by foo' });

            const stateAfterBar = reducer(
                { a: 2, b: 'different b' },
                { type: 'bar', payload: ' hello!!!' }
            );
            expect(stateAfterBar).toEqual({ a: 2, b: '<= 3 hello!!!' });
        });
    });

    describe('infers the right types', () => {
        const {
            types: { __reducerType }
        } = resolveTypes`
            import { createReducer, createHandlerMap } from './src';
            const state = {};
            const handlerMap = createHandlerMap(state, {});
            const reducer = createReducer(handlerMap);
            type __reducerType = typeof reducer;
        `;

        it('has the right type', () => {
            expect(__reducerType).toEqual('(state: {}, action: never) => {}');
        });
    });
});
