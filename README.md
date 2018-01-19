# typeful-redux

A type-safe, low boilerplate wrapper for redux to be used in TypeScript projects.

## Elevator pitch

This is how you create

```TypeScript
interface TodoItem {
    task: string;
    completed: boolean;
}

// Create a new reducer with initial state and three actions
const TodoReducer = crateReducer([] as TodoItem[])
    ('clear', s => [])
    ('add', (s, newItem: TodoItem) => [...s, newItem])
    ('toggle', (s, index: number) => [
        ...s.slice(0, i),
        { ...s[i], completed: !s[i].completed },
        ...s.slice(i + 1)
    ]);

// Create the store
const store = new StoreBuilder().addReducer('todos', TodoReducer).build();

// The result has type: { todos: TodoItem[] }
store.getState();

// Everything is fully typechecked
store.dispatch.todos.clear();
store.dispatch.todos.add({
    task: 'Provide a fully type-safe interface to redux',
    completed: false
});
store.dispatch.todos.toggle(0);
```

## Motivation

[redux] is a wonderful library to manage the state in single page applications.
Unfortunately, vanilla redux requires a lot of boilerplate and is hard to use
in a type-safe way. [typeful-redux] attempts to both reduce the amount of boilerplate
needed to create actions, reducers and stores and to provide a fully type-safe interface
to the redux store and dispatch function which can be used in a modular way.

## License

MIT


[redux]: http://redux.js.org
[typeful-redux]: https://gitlab.com/paul.koerbitz/typeful-redux