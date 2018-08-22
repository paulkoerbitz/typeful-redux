import { HandlerMap } from "../handler-map";

export const createActionCreators = <
    State,
    HM extends HandlerMap<State>
>(
    handlerMap: HM
): ActionCreatorsFromHandlerMap<State, HM> => {
    const result: any = {};
    for (const type in handlerMap) {
        if (!handlerMap.hasOwnProperty(type)) {
            continue;
        }
        result[type] = (payload: any) => ({ type, payload });
    }
    return result;
};

export const bindActionCreators = <
    ActionCreators extends { [key: string]: string | void | object }
>(
    actionCreators: ActionCreators,
    dispatch: (action: ActionsFromActionCreators<ActionCreators>) => void
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
