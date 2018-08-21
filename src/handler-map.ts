import { INITIAL_STATE_KEY } from './constants';
import { Arg1, Arg2 } from './type-helpers';

export type NonObjectOrFunction =
    | string
    | number
    | undefined
    | null
    | any[]
    | symbol;

export type MaybePartial<T> = T extends NonObjectOrFunction ? T : Partial<T>;

export type HandlerType<State, T> = T extends NonObjectOrFunction
    ? State extends T ? State : never
    : T extends (() => MaybePartial<State>)
        ? (() => MaybePartial<State>)
        : T extends ((payload: any) => MaybePartial<State>)
            ? (payload: Arg1<T>) => MaybePartial<State>
            : T extends ((state: State, payload: any) => MaybePartial<State>)
                ? ((state: State, payload: Arg2<T>) => MaybePartial<State>)
                : T extends MaybePartial<State> ? MaybePartial<State> : never;

export type HandlerMap<State, HM> = {
    [K in keyof HM]: HandlerType<State, HM[K]>
};

/**
 * Type-annotate a map from action names to handling functions
 */
export const createHandlerMap = <State, HM>(
    initialState: State,
    handlerMap: HM
): HandlerMap<State, HM> => {
    return {
        [INITIAL_STATE_KEY]: initialState,
        ...(handlerMap as any)
    } as any;
};
