import { Arg1, Arg2, Equals, If, Or } from './type-helpers';
import { HandlerMap } from './types';

export type ActionFromPayload<
    ActionName,
    Payload extends string | void | object
> = If<
    Or<Equals<Payload, ActionName>, Equals<Payload, void>>,
    { type: ActionName },
    { type: ActionName; payload: Payload }
>;

export type BoundActionCreatorFromPayload<
    ActionName,
    P extends ActionName | void | string | object
> = If<
    Or<Equals<P, ActionName>, Equals<P, void>>,
    () => void,
    (payload: P) => void
>;

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

export type ActionsFromHandlerMap<State, HM extends HandlerMap<State>> = {
    [ActionName in keyof HM]: ActionFromHandlerMapEntry<
        ActionName,
        HM[ActionName]
    >
}[keyof HM];

export type ActionCreatorFromPayload<
    ActionName,
    Payload extends string | void | object
> = If<
    Or<Equals<Payload, ActionName>, Equals<Payload, void>>,
    () => { type: ActionName },
    (payload: Payload) => { type: ActionName; payload: Payload }
>;

export type ActionCreatorFromHandlerMapEntry<
    ActionName,
    HmEntry
> = HmEntry extends (...xs: any[]) => any
    ? ActionCreatorFromPayload<ActionName, Arg2<HmEntry>>
    : (() => { type: ActionName });

export type ActionCreatorsFromHandlerMap<
    State,
    HM extends HandlerMap<State>
> = {
    [ActionName in keyof HM]: ActionCreatorFromHandlerMapEntry<
        ActionName,
        HM[ActionName]
    >
};

export type ActionsFromActionCreators<ActionCreators> = {
    [ActionName in keyof ActionCreators]: ActionFromPayload<
        ActionName,
        Arg1<ActionCreators[ActionName]>
    >
}[keyof ActionCreators];

export type BoundCreatorsFromActionCreators<
    ActionCreators extends { [key: string]: string | void | object }
> = {
    [ActionName in keyof ActionCreators]: BoundActionCreatorFromPayload<
        ActionName,
        Arg1<ActionCreators[ActionName]>
    >
};
