export type IfArity2<F, THEN, ELSE> = ((x1: any, x2: any) => any) extends F
    ? THEN
    : ELSE;

export type IfArity1<F, THEN, ELSE> = ((x1: any) => any) extends F
    ? THEN
    : ELSE;

export type Arg1<F> = ((x1: any) => any) extends F
    ? F extends ((x1: infer X1, ...xs: any[]) => any) ? X1 : never
    : never;

export type Arg2<F> = IfArity2<
    F,
    F extends ((x1: any, x2: infer X2, ...xs: any[]) => any) ? X2 : never,
    never
>;

export type Equals<X, Y> = X extends Y ? (Y extends X ? true : false) : false;

export type If<Test extends boolean, Then, Else> = Equals<
    Test,
    true
> extends true
    ? Then
    : Else;

export type Or<X extends boolean, Y extends boolean> = If<
    X,
    true,
    If<Y, true, false>
>;

export type GetKeys<U> = U extends Record<infer K, any> ? K : never;

export type UnionToIntersection<U> = {
    [K in GetKeys<U>]: U extends Record<K, infer T> ? T : never
};

export type NoInfer<T> = T & { [K in keyof T]: T[K] };

// Extracted from the follow issue comment
// https://github.com/Microsoft/TypeScript/issues/12936#issuecomment-368244671
// Use this as follows:
//
// type Foo = {a?: string, b: number}
//
// declare function requireExact<X extends Exactify<Foo, X>>(x: X): void;
//
// const exact = {b: 1};
// requireExact(exact); // okay
//
// const inexact = {a: "hey", b: 3, c: 123};
// requireExact(inexact);  // error
// Types of property 'c' are incompatible.
// Type 'number' is not assignable to type 'never'.
export type Exactify<T, X extends T> = T & {
    [K in keyof X]: K extends keyof T ? X[K] : never
}

export type NonPartial<T> = { [KEY in keyof T]-?: T[KEY]; };

export type GetArgumentsTupleType<F extends (...xs: any[]) => any> =
    F extends ((...rest: infer ARGS) => any) ? ARGS : never;

export type ReplaceReturnType<F extends (...xs: any[]) => any, NewReturnType> =
    (...xs: GetArgumentsTupleType<F>) => NewReturnType;