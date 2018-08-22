import * as Redux from 'redux';
import { Arg1, Arg2 } from '../types/helpers';
import { ActionsFromHandlerMap, StateFromHandlerMap } from "../handler-map";
import { INITIAL_STATE_KEY } from "../constants";
import { HandlerMapConstraint } from '../handler-map';

export type Reducer<State, Action extends Redux.Action> = Redux.Reducer<
    State,
    Action
>;

export type ReducerMap = { [reducerName: string]: Reducer<any, any> };

export interface CombineReducers {
    <RM extends ReducerMap>(reducers: RM): Reducer<
        { [Name in keyof RM]: Arg1<RM[Name]> },
        { [Name in keyof RM]: Arg2<RM[Name]> }[keyof RM]
    >;
}

export const createReducer = <
    HM extends HandlerMapConstraint<any>
>(
    handlerMap: HM
): Reducer<StateFromHandlerMap<HM>, ActionsFromHandlerMap<HM>> => {
    const initialState = (handlerMap as any)[INITIAL_STATE_KEY];
    return (
        s: StateFromHandlerMap<HM> | undefined,
        action: ActionsFromHandlerMap<HM>
    ): StateFromHandlerMap<HM> => {
        const handler = handlerMap[action.type];
        const oldS = s === undefined ? initialState : s;
        let newS = handler;
        if (typeof handler === 'function') {
            if ((handler as any).length === 1) {
                newS = (handler as any)((action as any).payload);
            } else {
                newS = (handler as any)(s, (action as any).payload);
            }
        }
        if (
            typeof newS === 'number' ||
            typeof newS === 'string' ||
            typeof newS === 'boolean' ||
            typeof newS === 'symbol' ||
            Array.isArray(newS)
        ) {
            return (newS as any) as StateFromHandlerMap<HM>;
        } else if (typeof newS === 'object') {
            return { ...(oldS as any), ...(newS as any) };
        } else {
            return oldS;
        }
    };
};

export const combineReducers: CombineReducers = Redux.combineReducers;

