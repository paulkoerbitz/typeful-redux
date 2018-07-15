export type HasArity2<F, THEN, ELSE> = ((
    x1: any,
    x2: any
) => any) extends F
    ? THEN
    : ELSE;

export type Arg1<F> = ((x1: any) => any) extends F
    ? F extends ((x1: infer X1, ...xs: any[]) => any) ? X1 : never
    : never;

export type Arg2<F> = HasArity2<
    F,
    F extends ((x1: any, x2: infer X2, ...xs: any[]) => any) ? X2 : never,
    never>;

export type Equals<X, Y> = X extends Y ? Y extends X ? true : false : false;

export type If<Test extends boolean, Then, Else> = Equals<Test, true> extends true ? Then : Else;

export type Or<X extends boolean, Y extends boolean> =
    If<X, true, If<Y, true, false>>;

export type GetKeys<U> = U extends Record<infer K, any> ? K : never;

export type UnionToIntersection<U> = {
    [K in GetKeys<U>]: U extends Record<K, infer T> ? T : never
};
