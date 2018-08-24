import {
    createReducer,
    createActionCreators,
    BoundCreatorsFromActionCreators,
    createHandlerMap
} from '../../../../src';
import { State, Dispatch } from '..';

export interface TodoItem {
    task: string;
    completed: boolean;
}

const handler = createHandlerMap([] as TodoItem[], {
    ADD_TODO: (s, task: string) => [...s, { task, completed: false }],
    CLEAR_TODOS: [],
    CLEAR_COMPLETED: (s: TodoItem[]) => s.filter(item => !item.completed),
    TOGGLE_TODO: (s, idx: number) => [
        ...s.slice(0, idx),
        { task: s[idx].task, completed: !s[idx].completed },
        ...s.slice(idx + 1)
    ],
    EDIT_TODO: (s, p: { idx: number; task: string }) => [
        ...s.slice(0, p.idx),
        { ...s[p.idx], task: p.task },
        ...s.slice(p.idx + 1)
    ],
    REMOVE_TODO: (s, idx: number) => [...s.slice(0, idx), ...s.slice(idx + 1)]
});

const delay = (timeInMs: number) =>
    new Promise(resolve => setTimeout(resolve, timeInMs));

const thunks = {
    ADD_TODO_DELAYED: (task: string) => async (
        dispatch: Dispatch,
        getState: () => State
    ) => {
        await delay(400);
        const state = getState();
        state;
        dispatch(actionCreators.ADD_TODO(task));
    }
};

export const reducer = createReducer(handler);
export const actionCreators = {
    ...createActionCreators(handler),
    ...thunks
};

export type Dispatch = BoundCreatorsFromActionCreators<typeof actionCreators>;
