import { createReducer, createActionCreators, BoundCreatorsFromActionCreators } from '../../../../src';

export interface TodoItem {
    task: string;
    completed: boolean;
}

const handler = {
    ADD_TODO: (s: TodoItem[], task: string) => [...s, { task, completed: false }],
    CLEAR_TODOS: (_s: TodoItem[]) => [],
    CLEAR_COMPLETED: (s: TodoItem[]) => s.filter(item => !item.completed),
    TOGGLE_TODO: (s: TodoItem[], idx: number) => [
        ...s.slice(0, idx),
        { task: s[idx].task, completed: !s[idx].completed },
        ...s.slice(idx + 1)
    ],
    EDIT_TODO: (s: TodoItem[], p: { idx: number; task: string; }) => [
        ...s.slice(0, p.idx),
        { ...s[p.idx], task: p.task },
        ...s.slice(p.idx + 1)
    ],
    REMOVE_TODO: (s: TodoItem[], idx: number) => [
        ...s.slice(0, idx), ...s.slice(idx + 1)
    ]
};

const initialState: TodoItem[] = [];

export const reducer = createReducer(initialState, handler);
export const actionCreators = createActionCreators(handler);
export type Dispatch = BoundCreatorsFromActionCreators<typeof actionCreators>;