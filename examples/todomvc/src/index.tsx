import 'todomvc-app-css/index.css';
import * as React from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers, bindActionCreators, connect, StoreState } from '../../../src';
import * as Todo from './reducers/Todo';
import * as Filter from './reducers/Filter';
import { TodoListComponent } from './components/TodoList';

const reducer = combineReducers({
    todos: Todo.reducer,
    filter: Filter.reducer
});

const store = createStore(reducer);

type State = StoreState<typeof store>;
type Dispatch = typeof store.dispatch;

const mapStateToProps = (state: State) => state;

const mapDisptachToProps = (dispatch: Dispatch): Todo.Dispatch & Filter.Dispatch => ({
    ...bindActionCreators(Todo.actionCreators, dispatch),
    ...bindActionCreators(Filter.actionCreators, dispatch)
});

const TodoListContainer =
    connect(mapStateToProps, mapDisptachToProps)(TodoListComponent);

render(
    <TodoListContainer store={store}/>,
    document.getElementById("app")
);
