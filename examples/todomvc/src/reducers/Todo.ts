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
    isSaved: boolean;
}

const replace = <T>(array: ReadonlyArray<T>, idx: number, newValue?: T): T[] =>
    (newValue == undefined)
        ? [...array.slice(0, idx), ...array.slice(idx + 1)]
        : [...array.slice(0, idx), newValue, ...array.slice(idx + 1)];

const handler = createHandlerMap([] as TodoItem[], {
    CREATE_TODO: (s, task: string) => [...s, { task, completed: false, isSaved: false }],
    MARK_TODO_SAVED: (s, idx: number) => replace(s, idx, { ...s[idx], isSaved: true }),
    CLEAR_TODOS: [],
    CLEAR_COMPLETED: (s: TodoItem[]) => s.filter(item => !item.completed),
    TOGGLE_TODO: (s, idx: number) => replace(s, idx, { ...s[idx], completed: !s[idx].completed }),
    EDIT_TODO: (s, p: { idx: number; task: string }) =>
        replace(s, p.idx, { ...s[p.idx], task: p.task }),
    REMOVE_TODO: (s, idx: number) => replace(s, idx)
});

const delay = (timeInMs: number) =>
    new Promise(resolve => setTimeout(resolve, timeInMs));

const thunks = {
    ADD_TODO: (task: string) => async (
        dispatch: Dispatch,
        getState: () => State
    ) => {
        dispatch(actionCreators.CREATE_TODO(task));
        const idx = getState().todos.length - 1;
        await delay(1000);
        dispatch(actionCreators.MARK_TODO_SAVED(idx));
    }
};

export const reducer = createReducer(handler);
export const actionCreators = {
    ...createActionCreators(handler),
    ...thunks
};

export type Dispatch = BoundCreatorsFromActionCreators<typeof actionCreators>;
