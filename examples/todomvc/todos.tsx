import * as React from 'react';
import { render } from 'react-dom';
import { createReducer, StoreBuilder, connect } from 'typeful-redux';

interface TodoItem {
    task: string;
    completed: boolean;
}

const TodoReducer = createReducer([] as TodoItem[])
    ('add', (s: TodoItem[], task: string) => [...s, { task, completed: false }])
    ('clear', (_s: TodoItem[]) => [])
    ('toggle', (s: TodoItem[], idx: number) => [
        ...s.slice(0, idx),
        { task: s[idx].task, completed: !s[idx].completed },
        ...s.slice(idx + 1)
    ]);

const store = new StoreBuilder()
    .addReducer('todos', TodoReducer)
    .build();

interface TodoProps {
    item: TodoItem;
    toggle(): void;
}

const TodoComponent = (p: TodoProps) =>
    <li onClick={p.toggle} >
        <input type="checkbox" checked={p.item.completed} />
        {p.item.task}
    </li>;

type TodoDispatch = typeof TodoReducer.__dispatchType;

type TodoListProps = {
    todos: TodoItem[];
} & TodoDispatch;

class TodoListComponent extends React.Component<TodoListProps> {
    private input: HTMLInputElement | null = null;

    private handleSubmit = (e: React.FormEvent<any>) => {
        e.preventDefault();
        if (this.input != null) {
            this.props.add(this.input.value);
            this.input.value = "";
        }
    }

    render() {
        const { todos, clear, toggle } = this.props;
        const items = todos.map((todo, idx) =>
            <TodoComponent key={idx} item={todo} toggle={() => toggle(idx)} />
        );

        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input type="text" ref={input => this.input = input}></input>
                    <button type="submit">Add</button>
                </form>
                <ul style={{ listStyle: "none" }}>
                    {items}
                </ul>
                <div>
                    <button onClick={clear}>Clear</button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: { todos: TodoItem[]; }) => ({
    todos: state.todos
});

const mapDisptachToProps = (dispatch: { todos: TodoDispatch; }) =>
    dispatch.todos;

const TodoListContainer =
    connect(mapStateToProps, mapDisptachToProps)(TodoListComponent);

render(
    <TodoListContainer store={store} />,
    document.getElementById("app")
);
