# TodoMVC Example

This example shows an implementation of the [TodoMVC](http://todomvc.com/) app.
It implements most of the functionality of the TodoMVC app. Routing as well as
 saving to and loading from local storage are not yet implemented.

## Setup

Use `npm` or `yarn` to install. Example:

`$ npm install`

## Run

`$ npm start` runs the app via webpack-dev-server. Visit `localhost:8080`.

## Overview

There are two reducers, `TodoReducer` and `FilterReducer` which live in the
[reducers/](./reducers/) directory. They are quite small and come in at 23 and 7 lines of code, respectively.

The two components `TodoComponent` and `TodoListComponent` are placed in the
[components/](./components/) directory.

The main file is [./src/index.tsx](./src/index.tsx), it uses the reducers to
create a store and creates the main application by connecting the store
to the TodoListComponent.