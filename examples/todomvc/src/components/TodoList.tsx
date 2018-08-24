import * as React from 'react';

import * as Todo from '../reducers/Todo';
import * as Filter from '../reducers/Filter';

import { TodoComponent } from './Todo';

export type TodoListProps = {
    todos: Todo.TodoItem[];
    filter: Filter.FilterType;
} & Todo.Dispatch &
    Filter.Dispatch;

export class TodoListComponent extends React.Component<TodoListProps> {
    private input: HTMLInputElement | null = null;

    private handleSubmit = async (e: React.FormEvent<any>) => {
        e.preventDefault();
        if (this.input != null) {
            await this.props.ADD_TODO_DELAYED(this.input.value);
            this.input.value = '';
        }
    };

    render() {
        const {
            todos,
            CLEAR_TODOS,
            TOGGLE_TODO,
            EDIT_TODO,
            REMOVE_TODO,
            CLEAR_COMPLETED,
            filter,
            FILTER_ALL,
            FILTER_ACTIVE,
            FILTER_COMPLETED,
        } = this.props;

        const visible =
            filter === 'all'
                ? todos
                : filter === 'active'
                    ? todos.filter(todo => !todo.completed)
                    : todos.filter(todo => todo.completed);

        const itemName = visible.length === 1 ? 'item' : 'items';

        const items = visible.map((todo, idx) => (
            <TodoComponent
                key={idx}
                item={todo}
                toggle={() => TOGGLE_TODO(idx)}
                edit={task => EDIT_TODO({ idx, task })}
                delete={() => REMOVE_TODO(idx)}
            />
        ));

        const clearCompletedButton = todos.some(todo => todo.completed) ? (
            <button onClick={CLEAR_COMPLETED} className="clear-completed">
                Clear completed
            </button>
        ) : (
            undefined
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
                            ref={input => (this.input = input)}
                        />
                    </form>
                </header>
                <section className="main">
                    <ul className="todo-list">{items}</ul>
                </section>
                <footer className="footer">
                    <span className="todo-count">
                        <strong>{todos.length}</strong> {itemName} left
                    </span>
                    <ul className="filters">
                        <li>
                            <button onClick={FILTER_ALL} style={{ margin: '0 1em' }}>
                                All
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={FILTER_ACTIVE}
                                style={{ margin: '0 1em' }}
                            >
                                Active
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={FILTER_COMPLETED}
                                style={{ margin: '0 1em' }}
                            >
                                Completed
                            </button>
                        </li>
                    </ul>
                    {clearCompletedButton}
                </footer>
            </div>
        );
    }
}
