import * as React from 'react';
import { render } from 'react-dom';
import {
    createReducer,
    createStore,
    createActionCreators,
    bindActionCreators,
    connect,
    createHandlerMap
} from '../../../src';

interface TodoItem {
    task: string;
    completed: boolean;
}

const TodoHandlers = createHandlerMap([] as TodoItem[], {
    ADD: (s, task: string) => [...s, { task, completed: false }],
    CLEAR: [],
    TOGGLE: (s, idx: number) => [
        ...s.slice(0, idx),
        { task: s[idx].task, completed: !s[idx].completed },
        ...s.slice(idx + 1)
    ]
});

const TodoReducer = createReducer(TodoHandlers);

const store = createStore(TodoReducer);

const actionCreators = createActionCreators(TodoHandlers);
const boundCreators = bindActionCreators(actionCreators, store.dispatch);

type Dispatch = typeof store.dispatch;


interface TodoProps {
    item: TodoItem;
    toggle(): void;
}

const TodoComponent = (p: TodoProps) => (
    <li onClick={p.toggle}>
        <input type="checkbox" checked={p.item.completed} />
        {p.item.task}
    </li>
);

type TodoListProps = {
    todos: TodoItem[];
} & typeof boundCreators;

class TodoListComponent extends React.Component<TodoListProps> {
    private input: HTMLInputElement | null = null;

    private handleSubmit = (e: React.FormEvent<any>) => {
        e.preventDefault();
        if (this.input != null) {
            this.props.ADD(this.input.value);
            this.input.value = '';
        }
    };

    render() {
        const { todos, CLEAR, TOGGLE } = this.props;
        const items = todos.map((todo, idx) => (
            <TodoComponent key={idx} item={todo} toggle={() => TOGGLE(idx)} />
        ));

        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input type="text" ref={input => (this.input = input)} />
                    <button type="submit">Add</button>
                </form>
                <ul style={{ listStyle: 'none' }}>{items}</ul>
                <div>
                    <button onClick={CLEAR}>Clear</button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: TodoItem[]) => ({ todos: state });

const mapDisptachToProps = (dispatch: Dispatch) => bindActionCreators(actionCreators, dispatch);

const TodoListContainer = connect(mapStateToProps, mapDisptachToProps)(
    TodoListComponent
);

render(<TodoListContainer store={store} />, document.getElementById('app'));
