import { INITIAL_STATE_KEY } from './constants';
import { Arg1, Arg2 } from './type-helpers';


export type StateFromHandlerMap<
    HandlerMap extends { [key in string]: (...xs: any[]) => any }
> = {
    [ActionName in keyof HandlerMap]: Arg1<HandlerMap[ActionName]>
}[keyof HandlerMap];

export type ActionFromHandlerMapEntry<ActionName, HmEntry> = HmEntry extends (
    ...xs: any[]
) => any
    ? ActionFromPayload<ActionName, Arg2<HmEntry>>
    : { type: ActionName };

export type ActionsFromHandlerMap<State, HM extends HandlerMapConstraint<State>> = {
    [ActionName in keyof HM]: ActionFromHandlerMapEntry<
        ActionName,
        HM[ActionName]
    >
}[keyof HM];

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

export type HandlerMapValueConstraint<State> =
    | State
    | MaybePartial<State>
    | (() => MaybePartial<State>)
    | ((payload: any) => MaybePartial<State>)
    | ((state: State, payload: any) => MaybePartial<State>);

export type HandlerMapConstraint<State> = {
    [key: string]: HandlerMapValueConstraint<State>;
};

/**
 * Type-annotate a map from action names to handling functions
 */
export const createHandlerMap = <
    State,
    HM extends HandlerMapConstraint<State>
>(
    initialState: State,
    handlerMap: HM
): HandlerMap<State, HM> => {
    return {
        [INITIAL_STATE_KEY]: initialState,
        ...(handlerMap as any)
    } as any;
};
