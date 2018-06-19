#!/usr/bin/env ts-node
import * as ts from 'typescript';

const FILENAME = "__ts-type-test-inline-e1d70ff1__"
const FILENAME_RE = new RegExp(FILENAME);

/**
 * TODOS:
 * - generalize parameter names & positions
 * - correctly extract compilation options
 * - make npm library out of this
 * - comment this code
 * - allow injecting options
 */

const resolveTypes = (code: string) => {
    let sf: ts.SourceFile;
    const ch = ts.createCompilerHost({})
    const getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget, ...args: any[]) => {
        if (!FILENAME_RE.test(fileName)) {
            return (ch.getSourceFile as any)(fileName, languageVersion, ...args);
        }
        if (sf == undefined) {
            sf = ts.createSourceFile(FILENAME, code, languageVersion);
        }
        return sf;
    };
    const myCh = {
        ...ch,
        getSourceFile
    };
    const prog = ts.createProgram([FILENAME], {}, myCh);
    const tc = prog.getTypeChecker();
    console.log(sf!.statements.map(stmt => [stmt, extract(tc.getTypeAtLocation(stmt))]));
    // console.log();
    // const type = tc.getTypeAtLocation(sf.statements[2]);
    // // console.log(flags, JSON.stringify(symbols.map(s => s.getName()).length, undefined, 4));
    // // const filtered = symbols.filter(symbol => /__1/.test(symbol.getName())).map(symbol =>
    // //     tc.getTypeOfSymbolAtLocation(symbol, sf)
    // // );
    // return type;
};

const extract = (x: any) => ({
    flags: x.flags,
    id: x.id,
    intrinsicName: x.intrinsicName
});

const onStringLit = (s: TemplateStringsArray) => {
    return resolveTypes(s[0]);
};

onStringLit`
type __1 = string;
`;