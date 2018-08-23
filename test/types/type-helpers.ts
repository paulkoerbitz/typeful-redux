import { resolveTypes } from 'resolve-types';

describe.skip('type-helpers', () => {
    describe('Arg1', () => {
        const {
            types: { __1, __2, __3, __4 },
            diagnostics
        } = resolveTypes`
            import { Arg1 } from './src/type-helpers';
            type ${1} = Arg1<(x: string) => void>;
            type ${2} = Arg1<(x: number, y: string) => void>;
            type ${3} = Arg1<() => void>;
            type ${4} = Arg1<string | undefined>;
        `;

        it('correctly infers the first argument type of a unary function', () => {
            expect(diagnostics).toEqual([]);
            expect(__1).toEqual('string');
        });

        it('correctly infers the first argument type of a binary function', () => {
            expect(diagnostics).toEqual([]);
            expect(__2).toEqual('number');
        });

        it('returns type "never" for a nullary function', () => {
            expect(diagnostics).toEqual([]);
            expect(__3).toEqual('never');
        });

        it('returns type "never" for a non-function', () => {
            expect(diagnostics).toEqual([]);
            expect(__4).toEqual('never');
        });
    });

    describe('Arg2', () => {
        const {
            types: { __1, __2, __3, __4, __5 },
            diagnostics
        } = resolveTypes`
            import { Arg2 } from './src/type-helpers';
            type ${1} = Arg2<(x: string, y: { foo: string; }) => void>;
            type ${2} = Arg2<(x: number, y: { bar: number; }, z: string) => void>;
            type ${3} = Arg2<(x: any) => void>;
            type ${4} = Arg2<() => void>;
            type ${5} = Arg2<string | {}>;
        `;

        it('correctly infers the second argument type of a binary function', () => {
            expect(diagnostics).toEqual([]);
            expect(__1).toEqual('{ foo: string; }');
        });

        it('correctly infers the second argument type of a trinary function', () => {
            expect(diagnostics).toEqual([]);
            expect(__2).toEqual('{ bar: number; }');
        });

        it('returns type "never" for a unary function', () => {
            expect(diagnostics).toEqual([]);
            expect(__3).toEqual('never');
        });

        it('returns type "never" for a nullary function', () => {
            expect(diagnostics).toEqual([]);
            expect(__4).toEqual('never');
        });

        it('returns type "never" for a non-function', () => {
            expect(diagnostics).toEqual([]);
            expect(__5).toEqual('never');
        });
    });

    describe('Equals', () => {
        const {
            types: { __1, __2 },
            diagnostics
        } = resolveTypes`
            import { Equals } from './src/type-helpers';
            type ${1} = Equals<string, string>;
            type ${2} = Equals<string, number>;
        `;

        it('Equals<string, string> resolves to true', () => {
            expect(diagnostics).toEqual([]);
            expect(__1).toEqual('true');
        });

        it('Equals<string, number> resolves to false', () => {
            expect(diagnostics).toEqual([]);
            expect(__2).toEqual('false');
        });
    })
});
