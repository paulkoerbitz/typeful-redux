import 'todomvc-app-css/index.css';
import * as React from 'react';
import { render } from 'react-dom';
// import { applyMiddleware } from 'redux';
import thunk, { ThunkMiddleware, ThunkDispatch } from 'redux-thunk';
import { applyMiddleware, combineReducers, bindActionCreators, connect, createStore, StoreState, StateFromReducer, ActionsFromReducer, DispatchFromReducer } from '../../../src';
import * as Todo from './reducers/Todo';
import * as Filter from './reducers/Filter';
import { TodoListComponent } from './components/TodoList';

const reducer = combineReducers({
    todos: Todo.reducer,
    filter: Filter.reducer
});

type RState = StateFromReducer<typeof reducer>;
type RAction = ActionsFromReducer<typeof reducer>;
type RDispatch = DispatchFromReducer<typeof reducer>;

const myThunk = thunk as ThunkMiddleware<
    RState,
    ActionsFromReducer<typeof reducer>
>;

const middleware = applyMiddleware<
    ThunkDispatch<RState, undefined, RAction>, RState, RAction, RDispatch>(myThunk);

type MWT = typeof middleware;

type SET = ReturnType<MWT>;

const store = middleware(createStore)(reducer);

type Store = typeof store;

export type State = StoreState<Store>;
export type Dispatch = typeof store.dispatch;

const mapStateToProps = (state: State) => state;


const mapDisptachToProps = (dispatch: Dispatch): Todo.Dispatch & Filter.Dispatch => {
    const bound = bindActionCreators(Todo.actionCreators, dispatch);

    return ({
    ...bindActionCreators(Todo.actionCreators, dispatch),
    ...bindActionCreators(Filter.actionCreators, dispatch)
});
};

const TodoListContainer =
    connect(mapStateToProps, mapDisptachToProps)(TodoListComponent);

render(
    <TodoListContainer store={store}/>,
    document.getElementById("app")
);
