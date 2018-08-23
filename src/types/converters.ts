import { Arg1, Arg2, Equals, If, Or } from './helpers';
import { HandlerMap, ActionFromPayload } from '../handler-map';


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
    HM extends HandlerMap<State, HM>
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
