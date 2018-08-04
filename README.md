# typeful-redux

[![npm version](https://img.shields.io/npm/v/typeful-redux.svg?style=flat-square)](https://www.npmjs.com/package/typeful-redux)

A type-safe, low boilerplate wrapper for redux to be used in TypeScript projects.

## Elevator pitch

This is how you create a reducer and a store with typeful-redux. Note that all
calls are fully type-safe and will trigger type errors when used incorrectly.

```TypeScript
interface Todo {
    task: string;
    completed: boolean;
}

// This map of handlers contains all the information we need
// to create fully type-safe reducers and (bound or unbound)
// action creators
const todoHandler = {
    CLEAR: (_state: Todo[]) => [] as Todo[],
    ADD: (state: Todo[], newTodo: Todo) => [...state, newItem],
    TOGGLE: (state: Todo[], index: number) => [
        ...state.slice(0, index),
        { state[index], completed: !state[index].completed },
        ...state.slice(index + 1)
    ]
};

const initialState: Todo[] = [];

// todoReducer has the type information on what state and
// actions it can reduce
const todoReducer = createReducer(initialState, todoHandler);

// Creates fully typed action creators for CLEAR, ADD, TOGGLE
const actionCreators = createActionCreators(todoHandler);

// Create the store - combineReducers is not needed but works ;)
const store = createStore(
    combineReducers({ todos: todoReducer })
);

// The state has type: { todos: Todo[] }
const state = store.getState();

// type error: action has the wrong form - expected just { type: 'CLEAR' }
store.dispatch({ type: 'CLEAR', payload: 'unexpected payload' });
// type error: missing payload
store.dispatch({ type: 'ADD' });

// These all typecheck
store.dispatch(actionCreators.ADD({ task: 'new todo', completed: false }));
store.dispatch(actionCreators.TOGGLE(0));
store.dispatch(actionCreators.CLEAR());

// Bound action creators dispatch directly - convenient for mapDispatchToProps
// This is equivalent to the above
const boundCreators = bindActionCreators(actionCreators, store.dispatch);
boundCreators.ADD({ task: 'new todo', completed: false });
boundCreators.TOGGLE(0);
boundCreators.CLEAR();
```

A very simple, runnable example app can be found [here](./examples/simple-todo/). A TodoMVC implementation with
slightly more features is availabe [here](./examples/todomvc/).

## Motivation

[redux] is a fantastic approach to manage state in single page applications.
Unfortunately, vanilla redux requires some boilerplate and is hard to use
in a type-safe way.

[typeful-redux]'s goal is to make it easy to use redux in a fully type-safe way while also reducing the amount of boilerplate required. This means the redux `getState` and `dispatch` functions need to have the right types and these types should be maintained when using the [react-redux] `connect` function. Furthermore, typeful-redux also provides helper functions
to easily create fully type-safe bound and un-bound action creators.

More specifically, [typeful-redux] seeks to address the following challenges when using redux:

  - **Full type safety:** redux makes it hard to fully type the `dispatch`
    method, to guarantee that only actions are dispatched which are handled by the store or that the dispatched actions are type correct (i.e. have the right payload).

    typeful-redux creates a store that gives a fully type-safe dispatch object, where every action is available as a function expecting the right payload. The `getState` method is also fully typed and returns a state with the right type.

  - **Low Boilerplate:** redux needs actions, possibly action creators and reducers.
    When trying to set this up in a type-safe way, many things need to be written down twice (or more). This introduces an opportunity for inconsistencies and errors.

    In typeful-redux, actions and their reducers are defined simultaneously,reducing the amount of code that needs to be written and maintained.

  - **Avoid inconsistencies:** When actions and reducers are defined
    seperately, there is the potential to forget handeling an action (or to misspell a type in a reducer's switch statement). typeful-redux makes this impossible by requiring the simultaneous definition of an action with its reducing code.

Besides these differences and different surface appearence, typeful-redux **is not an alternative redux implementation**, it is just a thin wrapper around reducer and store creation.
In fact the createStore and combineReducer functions are exactly the functions from redux,
they are just typed differently. All the existing redux ecosystem should be usable with this library. Please file an issue if you have trouble using a redux library with typeful-redux.

## Documentation

typeful-redux exports a few functions and type operators to make type-safe store and
action creator creations a breeze. All functions and operators are described here. Also see the [examples](./examples/) for example usages. If you find the documentation insufficient please file an issue or complain to me via email (see profile).

### typeful-redux functions and concepts

#### HandlerMap

A key concept in typeful-redux is the `HandlerMap`, an object
from action names to handler functions which is used to create
the reducer and action creators. The idea is that this object
contains all the naming and type information and thus it is
not necessary to type any more than that (pun intended!).

#### `Reducer`

A simple type capturing the type of reducers:

```TypeScript
type Reducer<State, Actions> = (state: State, action: Actions) => State;
```

#### `createReducer`

Takes an initial state and a *HandlerMap* and creates a reducer with
correctly typed state and action arguments.

It's full type signature is

```TypeScript
createReducer: <HandlerMap extends { [key in string]: (...xs: any[]) => any; }>(
    handler: HandlerMap
): Reducer<StateFromHandlerMap<HandlerMap>, ActionsFromHandlerMap<HandlerMap>>;
```

`StateFromHandlerMap` and `ActionsFromHandlerMap` are type operators
which extract the `State` and `Actions` types from the handler map.

#### `combineReducers`

This is the original combineReducers function from redux, the type
signature has been augmented to merge the state and action types so
that the resulting reducer is again fully typed.

#### `createStore`

This is the original `createStore` from redux, the type signature
has been augmented to fully capture the action types to give a
fully type-safe dispatch function.

#### `createActionCreators`

Takes a handler map and returns an object with type-safe action
creators. The action creators have the same name as the action
and either accept no arguments (for actions without payload) or
a single object which has the same type as the second argument
of the handler function.

#### `bindActionCreators`

Takes an object of action creators and a store's dispatch
method and returns an object of bound creators, meaning these
functions directly dispatch the actions.

#### `connect`

This is the original react-redux `connect` function with the type
augmented so that the type requirements from the connected component
correctly propagate through `mapStateToProps` and `mapDispatchToProps`.
This way, the connected component requires a store with the correct
`getState` and `dispatch` methods.

The type of `connect` prioritizes type corectness over convenience and
currently only supports invokation with both
`mapStateToProps` and `mapDispatchToProps`. However, it is easy enough
to just supply the identity function with either if the state or
dispatch does not need to be modified. The upside is that non-alignment
between state and dispatch and a connected components needs will be
caught as a type error.

### Usage with React's Context API

React 16.3 provides a [new context API](https://reactjs.org/docs/context.html#reactcreatecontext) which is actually possible to use
type correctly. So we're fans ;)

This is how you can use it with typeful-redux:

```TypeScript
const store = createStore(/* ... */);
const { Provider: StoreProvider, Consumer: StoreConsumer } =
    React.createContext(store);

render(
    <StoreProvider value={store}>
        /* ... */
        <StoreConsumer>
            {store => <App store={store}/>}
        </StoreConsumer>
        /* ... */
    </StoreProvider>,
    document.getElementById("app")
);
```

### Usage with redux-thunk

With the new API since version 0.4 it should be easier to use typeful-redux
with redux-thunk. An example is still in the works and some types might need
a little tweaking, but there should be something new here soon!

### Usage with redux-saga

Just as with redux-thunk, usage together with redux-saga is not fully thought through
yet, however, we're able to extract all action information from a redux store,
so typeful-redux *should* be able to provide a great basis for a fully-typed
redux-saga experience. Stay tuned.

## License

MIT

[redux]: http://redux.js.org
[react-redux]: https://github.com/reactjs/react-redux
[typeful-redux]: https://gitlab.com/paul.koerbitz/typeful-redux
