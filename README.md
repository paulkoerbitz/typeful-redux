# typeful-redux

A type-safe, low boilerplate way of using redux from TypeScript.

## Elevator Pitch

```TypeScript
// Create a new reducer with initial state and three actions
const TodoReducer = new ReducerBuilder([] as TodoItem[]).addSetter(
    'clear', s => []
).addHandler(
    'add', (s, newItem: TodoItem) => [...s, newItem]
).addHandler(
    'toggle', (s, index: number) => [
        ...s.slice(0, i),
        { ...s[i], completed: !s[i].completed },
        ...s.slice(i + 1)
    ]
);

// Create the store
const store = new StoreBuilder().addReducer('todos', TodoReducer).build();

store.getState(); // type: { todos: TodoItem[] }

// Everything is fully typechecked
store.dispatch.todos.clear();
store.dispatch.todos.add({
    task: 'Provide a fully type-safe interface to redux',
    completed: false
});
store.dispatch.todos.toggle(0);
```

## Status

alpha - tread carefully.

## Motivation

[redux] is a wonderful library to manage the state in single page applications.
Unfortunately, vanilla redux requires a lot of boilerplate and is hard to use
in a type-safe way. [typeful-redux] attempts to both reduce the amount of boilerplate
needed to create actions, reducers and stores and to provide a fully type-safe interface
to the redux store and dispatch function which can be used in a modular way.

## License

MIT


[redux]: http://redux.js.org
[typeful-redux]: https://github.com/paulkoerbitz/typeful-redux