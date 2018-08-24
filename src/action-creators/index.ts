import { Arg1, Arg2, Equals, If, Or, ReplaceReturnType } from '../types/helpers';
import { Dispatch } from '../types/redux';
import { HandlerMap, ActionFromPayload } from '../handler-map';

export const createActionCreators = <HM extends HandlerMap<any, HM>>(
    handlerMap: HM
): ActionCreatorsFromHandlerMap<HM> => {
    const result: any = {};
    for (const type in handlerMap) {
        if (!handlerMap.hasOwnProperty(type)) {
            continue;
        }
        result[type] = (payload: any) => ({ type, payload });
    }
    return result;
};

export type ActionCreatorsConstraint = {
    [key: string]: ((...xs: any[]) => any);
};

export const bindActionCreators = <
    ActionCreators extends ActionCreatorsConstraint
>(
    actionCreators: ActionCreators,
    dispatch: Dispatch<ActionsFromActionCreators<ActionCreators>>
): BoundCreatorsFromActionCreators<ActionCreators> => {
    const result = {} as any;
    for (const key in actionCreators) {
        if (!actionCreators.hasOwnProperty(key)) {
            continue;
        }
        result[key] = (payload: any) =>
            dispatch((actionCreators as any)[key](payload));
    }
    return result;
};

export type BoundActionCreatorFromPayload<
    ActionName,
    P extends ActionName | void | string | object
> = If<
    Or<Equals<P, ActionName>, Equals<P, void>>,
    () => void,
    (payload: P) => void
>;

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
> = HmEntry extends (x: any, y: any, ...xs: any[]) => any
    ? ActionCreatorFromPayload<ActionName, Arg2<HmEntry>>
    : (() => { type: ActionName });

export type ActionCreatorsFromHandlerMap<HM extends HandlerMap<any, HM>> = {
    [ActionName in keyof HM]: ActionCreatorFromHandlerMapEntry<
        ActionName,
        HM[ActionName]
    >
};

export type ActionsFromActionCreators<
    ActionCreators extends ActionCreatorsConstraint
> = {
    [ActionName in keyof ActionCreators]: ReturnType<ActionCreators[ActionName]>
}[keyof ActionCreators];

export type BoundCreatorsFromActionCreators<
    ActionCreators extends ActionCreatorsConstraint
> = {
    [ActionName in keyof ActionCreators]: ReplaceReturnType<
        ActionCreators[ActionName],
        void
    >
};
