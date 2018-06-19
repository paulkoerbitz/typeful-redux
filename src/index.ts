import * as redux from 'redux';
import { connect as redux_connect } from 'react-redux';
import { Reducer, CombineReducers, Connect, CreateStore} from './types';
import {
    ActionsFromHandlerMap,
    ActionCreatorsFromHandlerMap,
    ActionsFromActionCreators,
    BoundCreatorsFromActionCreators
} from './type-converters';

export const createReducer = <
    State,
    HandlerMap extends { [key in string]: (...xs: any[]) => any }
>(
    initialState: State,
    handlerMap: HandlerMap
): Reducer<
    State,
    ActionsFromHandlerMap<HandlerMap>
> => {
    return (
        s: State,
        action: ActionsFromHandlerMap<HandlerMap>
    ) => {
        if (action.type in handlerMap) {
            const handler = handlerMap[action.type];
            return handler(s, (action as any).payload);
        } else if (s === undefined) {
            return initialState;
        } else {
            return s;
        }
    };
};

export const combineReducers: CombineReducers = redux.combineReducers;

export const createStore: CreateStore = redux.createStore;

export const createActionCreators = <HandlerMap>(
    handlerMap: HandlerMap
): ActionCreatorsFromHandlerMap<HandlerMap> => {
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

export const connect: Connect = redux_connect;

export { BoundCreatorsFromActionCreators } from './type-converters';
export { Store, StoreState } from './types';