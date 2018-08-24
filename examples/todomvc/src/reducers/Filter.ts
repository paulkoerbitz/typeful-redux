 import {
    createHandlerMap,
    createReducer,
    createActionCreators,
    BoundCreatorsFromActionCreators
} from '../../../../src';

export type FilterType = 'all' | 'active' | 'completed';

const initialState = 'all' as FilterType;

const handler = createHandlerMap(initialState, {
    FILTER_ALL: 'all',
    FILTER_ACTIVE: 'active',
    FILTER_COMPLETED: 'completed'
});

export const reducer = createReducer(handler);
export const actionCreators = createActionCreators(handler);
export type Dispatch = BoundCreatorsFromActionCreators<typeof actionCreators>;
