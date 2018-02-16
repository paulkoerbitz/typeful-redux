import 'todomvc-app-css/index.css';
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
    ('clearCompleted', (s: TodoItem[]) => s.filter(item => !item.completed))
    ('toggle', (s: TodoItem[], idx: number) => [
        ...s.slice(0, idx),
        { task: s[idx].task, completed: !s[idx].completed },
        ...s.slice(idx + 1)
    ]);

type FilterType = 'all' | 'active' | 'completed';

const FilterReducer = createReducer('all' as FilterType)
    ('all', _s => 'all')
    ('active', _s => 'active')
    ('completed', _s => 'completed');

type FilterDispatch = typeof FilterReducer.__dispatchType;

const store = new StoreBuilder()
    .addReducer('todos', TodoReducer)
    .addReducer('filter', FilterReducer)
    .build();

interface TodoProps {
    item: TodoItem;
    toggle(): void;
}

const TodoComponent = (p: TodoProps) =>
    <li onClick={p.toggle} className={p.item.completed ? "completed" : ""}>
        <div className="view">
            <input className="toggle" type="checkbox" checked={p.item.completed} />
            <label>{p.item.task}</label>
            <button className="destroy" />
        </div>
    </li>;

type TodoDispatch = typeof TodoReducer.__dispatchType;

type TodoListProps =
    & TodoDispatch
    & FilterDispatch
    & {
        todos: TodoItem[];
        filter: FilterType;
    };

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
        const {
            todos, clear, toggle, clearCompleted,
            filter, all, active, completed
        } = this.props;

        const visible = filter === 'all'
            ? todos
            : filter === 'active'
                ? todos.filter(todo => !todo.completed)
                : todos.filter(todo => todo.completed);

        const itemName = visible.length === 1 ? "item" : "items";

        const items = visible.map((todo, idx) =>
            <TodoComponent key={idx} item={todo} toggle={() => toggle(idx)} />
        );

        return (
            <div>
                <header className="header">
                    <h1>todos</h1>
                    <form onSubmit={this.handleSubmit}>
                        <input
                            className="new-todo"
                            placeholder="What needs to be done?"
                            autoFocus={true}
                            ref={input => this.input = input}
                        />
                    </form>
                </header>
                <section className="main">
                    <ul className="todo-list">
                        {items}
                    </ul>
                </section>
                <footer className="footer">
                    <span className="todo-count"><strong>{todos.length}</strong> {itemName} left</span>
                    <ul className="filters">
                        <li>
                            <button onClick={all} style={{ margin: "0 1em" }}>All</button>
                        </li>
                        <li>
                            <button onClick={active} style={{ margin: "0 1em" }}>Active</button>
                        </li>
                        <li>
                            <button onClick={completed} style={{ margin: "0 1em" }}>Completed</button>
                        </li>
                    </ul>
                    <button onClick={clearCompleted} className="clear-completed">Clear completed</button>
                </footer>
            </div>
        );
    }
}

const mapStateToProps = (state: { todos: TodoItem[]; filter: FilterType; }) => ({
    todos: state.todos,
    filter: state.filter
});

const mapDisptachToProps = (dispatch: { todos: TodoDispatch; filter: FilterDispatch; }) => ({
    ...dispatch.todos, ...dispatch.filter

})

const TodoListContainer =
    connect(mapStateToProps, mapDisptachToProps)(TodoListComponent);

render(
    <TodoListContainer store={store} />,
    document.getElementById("app")
);
