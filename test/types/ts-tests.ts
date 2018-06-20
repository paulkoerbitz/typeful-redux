import 'jest';
import { resolveTypes } from 'resolve-types';

describe("Type Operators", () => {
    it("", () => {
        const { __1 } = resolveTypes`
            import * as TH from '../../src/type-helpers';
            type __1 = TH.Arg1<(x: string) => void>;
        `;
        expect(__1).toEqual("string");
    });
});