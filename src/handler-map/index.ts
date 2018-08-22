import { INITIAL_STATE_KEY } from '../constants';
import { Arg2, IfArity2, If, Or, Equals } from '../types/helpers';

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
        : T extends ((state: State) => MaybePartial<State>)
            ? (state: State) => MaybePartial<State>
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
    | ((state: State) => MaybePartial<State>)
    | ((state: State, payload: any) => MaybePartial<State>);

export type HandlerMapConstraint<State> = {
    [key: string]: HandlerMapValueConstraint<State>;
};

/**
 * Type-annotate a map from action names to handling functions
 */
export const createHandlerMap = <State, HM extends HandlerMapConstraint<State>>(
    initialState: State,
    handlerMap: HM
): HandlerMap<State, HM> => {
    return {
        [INITIAL_STATE_KEY]: initialState,
        ...(handlerMap as any)
    } as any;
};

export type StateFromHandlerMap<
    HM extends HandlerMap<any, HM>
> = HM extends HandlerMap<infer State, HM> ? State : never;

export type ActionFromPayload<
    ActionName,
    Payload extends string | void | object
> = If<
    Or<Equals<Payload, ActionName>, Equals<Payload, void>>,
    { type: ActionName },
    { type: ActionName; payload: Payload }
>;

export type ActionFromHandlerMapEntry<
    ActionName,
    HmEntry extends HandlerMapValueConstraint<any>
> = IfArity2<
    HmEntry,
    ActionFromPayload<ActionName, Arg2<HmEntry>>,
    { type: ActionName }
>;

export type ActionsFromHandlerMap<HM extends HandlerMapConstraint<any>> = {
    [ActionName in keyof HM]: ActionFromHandlerMapEntry<
        ActionName,
        HM[ActionName]
    >
}[keyof HM];
