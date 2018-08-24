import { combineReducers as redux_combineReducers } from 'redux';
import { Action } from '../types/redux';
import { Arg1, Arg2, If, Equals, IfArity2 } from '../types/helpers';
import { ActionsFromHandlerMap, StateFromHandlerMap } from '../handler-map';
import { INITIAL_STATE_KEY } from '../constants';
import { HandlerMapConstraint } from '../handler-map';

export type Reducer<S, A extends Action> = (
    state: S | undefined,
    action: A
) => S;

export const createReducer = <HM extends HandlerMapConstraint<any>>(
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
            newS = (handler as any)(s, (action as any).payload);
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

export type ReducersMapObject<S, A extends Action> = {
    [K in keyof S]: Reducer<S[K], A>
};

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @template S Combined state object type.
 *
 * @param reducers An object whose values correspond to different reducer
 *   functions that need to be combined into one. One handy way to obtain it
 *   is to use ES6 `import * as reducers` syntax. The reducers may never
 *   return undefined for any action. Instead, they should return their
 *   initial state if the state passed to them was undefined, and the current
 *   state for any unrecognized action.
 *
 * @returns A reducer function that invokes every reducer inside the passed
 *   object, and builds a state object with the same shape.
 */
interface CombineReducers {
    <S, A extends Action>(reducers: ReducersMapObject<S, A>): Reducer<S, A>;
}

export const combineReducers: CombineReducers = redux_combineReducers;

