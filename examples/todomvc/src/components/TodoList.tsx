import * as React from 'react';

import { TodoDispatch, TodoItem } from '../reducers/Todo';
import { FilterDispatch, FilterType } from '../reducers/Filter';

import { TodoComponent } from './Todo';


export type TodoListProps =
    & TodoDispatch
    & FilterDispatch
    & {
        todos: TodoItem[];
        filter: FilterType;
    };

export class TodoListComponent extends React.Component<TodoListProps> {
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
            todos, clear, toggle, edit, remove, clearCompleted,
            filter, all, active, completed
        } = this.props;

        const visible = filter === 'all'
            ? todos
            : filter === 'active'
                ? todos.filter(todo => !todo.completed)
                : todos.filter(todo => todo.completed);

        const itemName = visible.length === 1 ? "item" : "items";

        const items = visible.map((todo, idx) =>
            <TodoComponent
                key={idx}
                item={todo}
                toggle={() => toggle(idx)}
                edit={task => edit({ idx, task })}
                delete={() => remove(idx)}
            />
        );

        const clearCompletedButton = todos.some(todo => todo.completed)
            ? <button onClick={clearCompleted} className="clear-completed">Clear completed</button>
            : undefined;


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
                    {clearCompletedButton}
                </footer>
            </div>
        );
    }
}
