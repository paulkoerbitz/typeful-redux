import { createReducer } from 'typeful-redux';

export interface TodoItem {
    task: string;
    completed: boolean;
}

export const TodoReducer = createReducer([] as TodoItem[])
    ('add', (s: TodoItem[], task: string) => [...s, { task, completed: false }])
    ('clear', (_s: TodoItem[]) => [])
    ('clearCompleted', (s: TodoItem[]) => s.filter(item => !item.completed))
    ('toggle', (s: TodoItem[], idx: number) => [
        ...s.slice(0, idx),
        { task: s[idx].task, completed: !s[idx].completed },
        ...s.slice(idx + 1)
    ])
    ('edit', (s: TodoItem[], p: { idx: number; task: string; }) => [
        ...s.slice(0, p.idx),
        { ...s[p.idx], task: p.task },
        ...s.slice(p.idx + 1)
    ])
    ('remove', (s: TodoItem[], idx: number) => [
        ...s.slice(0, idx), ...s.slice(idx + 1)
    ]);

export type TodoDispatch = typeof TodoReducer.__dispatchType;
