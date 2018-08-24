import 'todomvc-app-css/index.css';
import * as React from 'react';
import { render } from 'react-dom';
import {
    applyMiddleware,
    combineReducers,
    bindActionCreators,
    connect,
    createStore,
    StoreState,
    StateFromReducer,
    ActionsFromReducer,
    thunk,
    ThunkMiddleware
} from '../../../src';
import * as Todo from './reducers/Todo';
import * as Filter from './reducers/Filter';
import { TodoListComponent } from './components/TodoList';

const reducer = combineReducers({
    todos: Todo.reducer,
    filter: Filter.reducer
});

type RState = StateFromReducer<typeof reducer>;
type RAction = ActionsFromReducer<typeof reducer>;

const middleware = applyMiddleware(
    thunk as ThunkMiddleware<RState, RAction, undefined>
);

const store = middleware(createStore)(reducer);

type Store = typeof store;

export type State = StoreState<Store>;
export type Dispatch = typeof store.dispatch;

const mapStateToProps = (state: State) => state;

const mapDisptachToProps = (dispatch: Dispatch) => ({
    ...bindActionCreators(Todo.actionCreators, dispatch),
    ...bindActionCreators(Filter.actionCreators, dispatch)
});

const TodoListContainer = connect(
    mapStateToProps,
    mapDisptachToProps
)(TodoListComponent);

render(<TodoListContainer store={store} />, document.getElementById('app'));
