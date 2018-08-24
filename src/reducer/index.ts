import { combineReducers as redux_combineReducers } from 'redux';
import { Action, Dispatch } from '../types/redux';
import { Arg1, Arg2, If, Equals, IfArity2, NonPartial } from '../types/helpers';
import { ActionsFromHandlerMap, StateFromHandlerMap } from '../handler-map';
import { INITIAL_STATE_KEY } from '../constants';
import { HandlerMapConstraint } from '../handler-map';

export type Reducer<S, A> = (
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

// export interface CombineReducers {
//     <RM extends ReducerMap>(reducers: RM): Reducer<
//         { [Name in keyof RM]: Arg1<RM[Name]> },
//         { [Name in keyof RM]: Arg2<RM[Name]> }[keyof RM]
//     >;
// }

export type ReducersMapObject<S = any> = { [K in keyof S]: Reducer<S[K], Action> };

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
    <RM extends ReducersMapObject>(reducers: RM): Reducer<
        { [K in keyof RM]: StateFromReducer<RM[K]>; },
        { [K in keyof RM]: Arg2<RM[K]> }[keyof RM]
    >;
}

export const combineReducers: CombineReducers = redux_combineReducers;

export type StateFromReducer<R extends Reducer<any, any>> = R extends Reducer<
    infer S,
    any
>
    ? S
    : never;

export type ActionsFromReducer<R extends Reducer<any, any>> = R extends Reducer<
    any,
    infer A
>
    ? A
    : never;

/**
 * Type of dispatch function that a store created with this
 * reducer would have.
 */
export type DispatchFromReducer<R extends Reducer<any, any>> = Dispatch<
    ActionsFromReducer<R>
>;
