import 'jest';
import { createHandlerMap } from './handler-map';
import { INITIAL_STATE_KEY } from './constants';
import { resolveTypes, setOptions } from 'resolve-types';
import { Diagnostic } from 'typescript';

setOptions({ noErrorTruncation: true });

const getDiagnosticMessages = (diagnostics: ReadonlyArray<Diagnostic>) =>
    diagnostics.map(
        d =>
            typeof d.messageText === 'string'
                ? d.messageText
                : d.messageText.messageText
    );

describe('Handler Map', () => {
    describe('createHandlerMap runtime', () => {
        it(`adds the initial state under the ${INITIAL_STATE_KEY} field`, () => {
            const initial = { a: 3, b: 'foo' };
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
            returnTypeAnnotation: ' as Foo',
            foo: "'foo'",
            bar: "'bar'",
            quox: "'quox'"
        },
        {
            type: 'number[]',
            expectedIn: 'number[]',
            expectedOut: 'number[]',
            foo: '[]',
            bar: '[1,2,3]',
            quox: '[]'
        },
        {
            type: '{ a: number; b: string; c: { d: number; }; }',
            expectedIn: 'Foo',
            expectedOut: 'Partial<Foo>',
            foo: '{ a: 3 }',
            bar: '{ a: 5, b: "bar" }',
            quox: '{ b: "quox", c: { d: 5 } }'
        }
    ];

    for (let {
        type,
        expectedIn,
        expectedOut,
        returnTypeAnnotation,
        foo,
        bar,
        quox
    } of testParameters) {
        returnTypeAnnotation = returnTypeAnnotation || '';
        describe(`createHandlerMap return type for type ${type}`, () => {
            const code = `
                import { createHandlerMap, HandlerType, HandlerMap } from './src/handler-map';

                type Foo = ${type};
                const initialState = ${foo} as Foo;

                const emptyHandlerMap = createHandlerMap(initialState, {});
                type __emptyHandlerMapType = typeof emptyHandlerMap;

                const stringLiteralHandlerMap = createHandlerMap(initialState, {
                    SET_FOO: ${foo}${returnTypeAnnotation},
                });
                type __stringLiteralHandlerMapType = typeof stringLiteralHandlerMap;

                const nullarySetterHandlerMap = createHandlerMap(initialState, {
                    SET_BAR: () => (${bar}${returnTypeAnnotation}),
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
                    SET_FOO: ${foo}${returnTypeAnnotation} ,
                    SET_BAR: () => (${bar}${returnTypeAnnotation}),
                    SET_QUOX: (x: number) => (x > 0 ? ${bar} : ${quox}),
                    SET_BAAZ: (s, x: number) => (x > 0 ? ${bar} : ${quox}),
                });
                type __allTogetherHandlerMapType = typeof allTogetherHandlerMap;
            `;

            const { types, diagnostics } = resolveTypes(code);

            it('works without type errors', () => {
                expect(getDiagnosticMessages(diagnostics)).toEqual([]);
            });

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

    describe('createHandlerMap creates type errors when', () => {
        const testParameters = [
            {
                type: "'foo' | 'bar' | 'quox'",
                values: { valid: "'foo'", invalid: "'baaz'" },
                typeSynonyms: {
                    state: ['Foo', "'foo' | 'bar' | 'quox'"],
                    invalid: ['"baaz"', 'string', '"foo"']
                }
            },
            {
                type: 'number[]',
                values: { valid: '[1, 2]', invalid: "[1, 2, 'bar']" },
                typeSynonyms: {
                    state: ['number[]'],
                    invalid: ['(string | number)[]', 'number[]']
                }
            },
            {
                type: '{ a: number; b: string; c: { d: number; }; }',
                values: {
                    valid: "{ a: 3, b: 'foo', c: { d: 5 } }",
                    invalid: '{ a: "foo" }'
                },
                typeSynonyms: {
                    state: ['Foo'],
                    invalid: ['{ a: string; }', '{ a: number; b: string; c: { d: number; }; }']
                }
            }
        ];

        /**
         * Computes all combinations of strings. [['a', 'b'], ['c'], ['x', 'y']]
         * gives [['a', 'c', 'x'], ['b', 'c', 'x'], ['a', 'c', 'y'], ['b', 'c', 'y']]
         */
        const allCombinations = (xs: string[][]): string[][] => {
            if (xs.length <= 0) {
                return [];
            }
            if (xs.length === 1) {
                return xs[0].map(x => [x]);
            }
            const result: string[][] = [];
            const subResults = allCombinations(xs.slice(1));
            for (const subResult of subResults) {
                for (const x of xs[0]) {
                    result.push([x, ...subResult]);
                }
            }
            return result;
        };

        const createMessages = (
            msgCreator: (...xs: string[]) => string,
            synonyms: string[][]
        ) =>
            allCombinations(synonyms).map(combination =>
                msgCreator(...combination)
            );

        const expectToEqualWithSynonyms = (
            msg: string,
            msgProvider: (...xs: string[]) => string,
            synonyms: string[][]
        ): void => {
            const msgs = createMessages(msgProvider, synonyms);
            expect(msgs).toContain(msg);
        };

        for (const { type, values, typeSynonyms } of testParameters) {
            const handlerPairs = [
                [`{ SETTER: ${values.invalid} }`, it => `{ SETTER: ${it}; }`],
                [
                    `{ NULLARY: () => (${values.invalid}) }`,
                    it => `{ NULLARY: () => ${it}; }`
                ],
                [
                    `{ UNARY: (payload: number) => (${values.invalid}) }`,
                    it => `{ UNARY: (payload: number) => ${it}; }`
                ],
                [
                    `{ BINARY: (state: ${typeSynonyms.state[0]}, payload: number) => (${values.invalid}) }`,
                    it => `{ BINARY: (state: ${typeSynonyms.state[0]}, payload: number) => ${it}; }`
                ],
                // Invalid state parameter
                [
                    `{ BINARY: (state: number, payload: number) => (${values.valid}) }`,
                    it => `{ BINARY: (state: number, payload: number) => ${it}; }`
                ]
            ].map(
                ([handlerMap, typesCreator]: [string, (x: string) => string]) =>
                    [
                        handlerMap,
                        createMessages(typesCreator, [typeSynonyms.invalid])
                    ] as [string, string[]]
            );

            for (const [handlerMap, handlerTypes] of handlerPairs) {
                it(`invalid handler map ${handlerMap} for state ${type} is provided`, () => {
                    const code = `
                        import { createHandlerMap, HandlerType } from './src/handler-map';

                        type Foo = ${type};
                        const initialState = ${values.valid} as Foo;

                        const stringLiteralHandlerMap = createHandlerMap(initialState, ${handlerMap});
                        type __wrongHandlerType = typeof stringLiteralHandlerMap;
                    `;
                    const message = getDiagnosticMessages(
                        resolveTypes(code).diagnostics
                    )[0];

                    const synonyms = [handlerTypes, [type, 'Foo']];

                    const messageCreator = (
                        handlerType: string,
                        stateType: string
                    ) =>
                        `Argument of type '${handlerType}' is not assignable to parameter of type 'HMConstraint<${stateType}>'.`;

                    expectToEqualWithSynonyms(
                        message,
                        messageCreator,
                        synonyms
                    );
                });
            }
        }
    });
});
