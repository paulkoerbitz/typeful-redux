import 'todomvc-app-css/index.css';
import * as React from 'react';
import { render } from 'react-dom';
import { StoreBuilder, connect } from 'typeful-redux';
import { TodoReducer } from './reducers/Todo';
import { FilterReducer } from './reducers/Filter';
import { TodoListComponent } from './components/TodoList';

const store = new StoreBuilder()
    .addReducer('todos', TodoReducer)
    .addReducer('filter', FilterReducer)
    .build();

const fakeState = (false as true) && store.getState();
type State = typeof fakeState;
type Dispatch = typeof store.dispatch;

const mapStateToProps = (state: State) => state;

const mapDisptachToProps = (dispatch: Dispatch) => ({
    ...dispatch.todos, ...dispatch.filter
});

const TodoListContainer =
    connect(mapStateToProps, mapDisptachToProps)(TodoListComponent);

render(
    <TodoListContainer store={store}/>,
    document.getElementById("app")
);
