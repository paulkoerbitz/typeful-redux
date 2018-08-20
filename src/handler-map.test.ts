import 'jest';
import { createHandlerMap } from './handler-map';
import { INITIAL_STATE_KEY } from './constants';
import { resolveTypes, setOptions } from 'resolve-types';

setOptions({ noErrorTruncation: true });

describe('Handler Map', () => {
    describe('createHandlerMap runtime', () => {
        it(`adds the initial state under the ${INITIAL_STATE_KEY} field`, () => {
            const initial = { a: 3, b: "foo" };
            const hm = createHandlerMap(initial, {});
            expect(hm[INITIAL_STATE_KEY]).toEqual(initial);
        });

        it('returns the handler map unchanged otherwise', () => {
            const map = { a: 3, b: 'foo' };
            const hm = createHandlerMap({}, map);
            for (const key in map) {
                expect(hm[key]).toEqual(map[key]);
            }
        });
    });

    const testParameters = [
        {
            type: "'foo' | 'bar' | 'quox'",
            expectedIn: 'Foo',
            expectedOut: 'Foo',
            foo: "'foo'",
            bar: "'bar'",
            quox: "'quox'"
        },
        {
            type: "number[]",
            expectedIn: "number[]",
            expectedOut: "number[]",
            foo: '[]',
            bar: '[1,2,3]',
            quox: '[]'
        },
        {
            type: "{ a: number; b: string; c: { d: number; }; }",
            expectedIn: "Foo",
            expectedOut: "Partial<Foo>",
            foo: '{ a: 3 }',
            bar: '{ a: 5, b: "bar" }',
            quox: '{ b: "quox", c: { d: 5 } }'
        }
    ];

    for (const { type, expectedIn, expectedOut, foo, bar, quox } of testParameters) {
        describe(`createHandlerMap return type for type ${type}`, () => {
            const code = `
                import { createHandlerMap, HandlerType } from './src/handler-map';

                type Foo = ${type};
                const initialState = ${foo} as Foo;

                const emptyHandlerMap = createHandlerMap(initialState, {});
                type __emptyHandlerMapType = typeof emptyHandlerMap;

                const stringLiteralHandlerMap = createHandlerMap(initialState, {
                    SET_FOO: ${foo},
                });
                type __stringLiteralHandlerMapType = typeof stringLiteralHandlerMap;

                const nullarySetterHandlerMap = createHandlerMap(initialState, {
                    SET_BAR: () => (${bar}),
                });
                type __nullarySetterHandlerMapType = typeof nullarySetterHandlerMap;

                const unarySetterHandlerMap = createHandlerMap(initialState, {
                    SET_QUOX: (x: number) => (x > 0 ? ${bar} : ${quox}),
                });
                type __unarySetterHandlerMapType = typeof unarySetterHandlerMap;

                const binarySetterHandlerMap = createHandlerMap(initialState, {
                    SET_BAAZ: (s, x: number) => (x > 0 ? ${bar} : ${quox}),
                });
                type __binarySetterHandlerMapType = typeof binarySetterHandlerMap;

                const allTogetherHandlerMap = createHandlerMap(initialState, {
                    SET_FOO: ${foo},
                    SET_BAR: () => (${bar}),
                    SET_QUOX: (x: number) => (x > 0 ? ${bar} : ${quox}),
                    SET_BAAZ: (s, x: number) => (x > 0 ? ${bar} : ${quox}),
                });
                type __allTogetherHandlerMapType = typeof allTogetherHandlerMap;
            `;

            const { types } = resolveTypes(code);

            it('is an empty object for an empty handler map', () => {
                expect(types['__emptyHandlerMapType']).toEqual('{}');
            });

            it('has correct literal types for handlers directly providing values', () => {
                expect(types['__stringLiteralHandlerMapType']).toEqual(
                    `{ SET_FOO: ${expectedOut}; }`
                );
            });

            it('has correct types for a nullary setter function', () => {
                expect(types['__nullarySetterHandlerMapType']).toEqual(
                    `{ SET_BAR: () => ${expectedOut}; }`
                );
            });

            it('has correct types for a unary setter function', () => {
                expect(types['__unarySetterHandlerMapType']).toEqual(
                    `{ SET_QUOX: (payload: number) => ${expectedOut}; }`
                );
            });

            it('has correct types for a binary setter function', () => {
                expect(types['__binarySetterHandlerMapType']).toEqual(
                    `{ SET_BAAZ: (state: ${expectedIn}, payload: number) => ${expectedOut}; }`
                );
            });

            it('has correct types for all handlers together', () => {
                expect(types['__allTogetherHandlerMapType']).toEqual(
                    `{ SET_FOO: ${expectedOut}; SET_BAR: () => ${expectedOut}; SET_QUOX: (payload: number) => ${expectedOut}; SET_BAAZ: (state: ${expectedIn}, payload: number) => ${expectedOut}; }`
                );
            });
        });
    }
});
