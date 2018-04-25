import * as React from 'react';
import { render } from 'react-dom';
import { createReducer, combineReducers, createStore, createActionCreators, connect } from '../../../src';

interface TodoItem {
    task: string;
    completed: boolean;
}

const TodoReducer = createReducer([] as TodoItem[], {
    ADD: (s: TodoItem[], task: string) => [...s, { task, completed: false }],
    CLEAR: (_s: TodoItem[]) => [],
    TOGGLE: (s: TodoItem[], idx: number) => [
        ...s.slice(0, idx),
        { task: s[idx].task, completed: !s[idx].completed },
        ...s.slice(idx + 1)]
});

const store = createStore(combineReducers({ 'todos': TodoReducer }));
const actionCreators = createActionCreators(TodoReducer);

type Dispatch = typeof store.dispatch;

interface TodoProps {
    item: TodoItem;
    toggle(): void;
}

const TodoComponent = (p: TodoProps) =>
    <li onClick={p.toggle} >
        <input type="checkbox" checked={p.item.completed} />
        {p.item.task}
    </li>;

type TodoListProps = {
    todos: TodoItem[];
} & Dispatch;

class TodoListComponent extends React.Component<TodoListProps> {
    private input: HTMLInputElement | null = null;

    private handleSubmit = (e: React.FormEvent<any>) => {
        e.preventDefault();
        if (this.input != null) {
            this.props.ADD(this.input.value);
            this.input.value = "";
        }
    }

    render() {
        const { todos, CLEAR, TOGGLE } = this.props;
        const items = todos.map((todo, idx) =>
            <TodoComponent key={idx} item={todo} toggle={() => TOGGLE(idx)} />
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
                    <button onClick={CLEAR}>Clear</button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: { todos: TodoItem[]; }) => state;

const mapDisptachToProps = (dispatch: Dispatch) => dispatch;

const TodoListContainer =
    connect(mapStateToProps, mapDisptachToProps)(TodoListComponent);

render(
    <TodoListContainer store={store} />,
    document.getElementById("app")
);





