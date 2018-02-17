import { createReducer } from 'typeful-redux';

export type FilterType = 'all' | 'active' | 'completed';

export const FilterReducer = createReducer('all' as FilterType)
    ('all', _s => 'all')
    ('active', _s => 'active')
    ('completed', _s => 'completed');

export type FilterDispatch = typeof FilterReducer.__dispatchType;
