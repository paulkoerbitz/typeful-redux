import { Arg1, Arg2, Equals, If, Or } from './type-helpers';

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

export type ActionsFromHandlerMap<HandlerMap> = {
    [ActionName in keyof HandlerMap]: ActionFromPayload<
        ActionName,
        Arg2<HandlerMap[ActionName]>
    >
}[keyof HandlerMap];

export type ActionCreatorFromPayload<
    ActionName,
    Payload extends string | void | object
> = If<
    Or<Equals<Payload, ActionName>, Equals<Payload, void>>,
    () => { type: ActionName },
    (payload: Payload) => { type: ActionName; payload: Payload }
>;

export type ActionCreatorsFromHandlerMap<HandlerMap> = {
    [ActionName in keyof HandlerMap]: ActionCreatorFromPayload<
        ActionName,
        Arg2<HandlerMap[ActionName]>
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
