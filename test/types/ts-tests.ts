import 'jest';
import { resolveTypes } from 'resolve-types';

describe('Type Operators', () => {
    describe('Arg1', () => {
        const {
            __1,
            __2,
            __3,
            __4
        } = resolveTypes`
            import * as TH from './src/type-helpers';
            type __1 = TH.Arg1<(x: string) => void>;
            type __2 = TH.Arg1<(x: string, y: number) => void>;
            type __3 = TH.Arg1<{ x: string, y: number }>;
            type __4 = TH.Arg1<() => void>;
        `;

        it('extracts first type argument of a univariate function', () => {
            expect(__1).toEqual('string');
        });

        it('extracts first type argument of a bivariate function', () => {
            expect(__2).toEqual('string');
        });

        it("returns 'never' if the argument is not a function", () => {
            expect(__3).toEqual('never');
        });

        it("returns 'never' if the argument is a nullary function", () => {
            expect(__4).toEqual('never');
        });
    });

    describe('Arg2', () => {
        const {
            __1,
            __2,
            __3,
            __4,
            __5
        } = resolveTypes`
            import * as TH from './src/type-helpers';
            type __1 = TH.Arg2<(x: string, y: number) => void>;
            type __2 = TH.Arg2<(x: string) => void>;
            type __3 = TH.Arg2<(x: string, y: number, z: {}) => void>;
            type __4 = TH.Arg2<() => void>;
            type __5 = TH.Arg2<{ x: string; y: number }>;
        `;

        it("returns the type of the second argument for a binary function", () => {
            expect(__1).toEqual("number");
        });

        it("returns never for a uniary function", () => {
            expect(__2).toEqual("never");
        });

        it("returns the type of the second argument for a trinary function", () => {
            expect(__3).toEqual("number");
        });

        it("returns never for a nullary function", () => {
            expect(__4).toEqual("never");
        });

        it("returns never for a non-function", () => {
            expect(__5).toEqual("never");
        });
    });
});

describe("Type Converters", () => {
    describe("ActionsFromHandlerMap", () => {
        it("extracts a simple action", () => {
            const { __1 } = resolveTypes`
                import { ActionsFromHandlerMap } from './src/type-converters';
                type __1 = ActionsFromHandlerMap<{ Action1: (state: string[], payload: string) => string[]; }>;
            `;
            expect(__1).toEqual('{ type: "Action1"; payload: string; }');
        });
    });

    describe("ActionCreatorsFromHandlerMap", () => {});
});