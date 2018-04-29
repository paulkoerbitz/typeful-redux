import { createReducer, createActionCreators, BoundCreatorsFromActionCreators } from '../../../../src';

export type FilterType = 'all' | 'active' | 'completed';

const initialState: FilterType = 'all';

const handler = {
    FILTER_ALL: (_s: FilterType) => 'all',
    FILTER_ACTIVE: (_s: FilterType) => 'active',
    FILTER_COMPLETED: (_s: FilterType) => 'completed'
};

export const reducer = createReducer(initialState, handler);
export const actionCreators = createActionCreators(handler);
export type Dispatch = BoundCreatorsFromActionCreators<typeof actionCreators>;
