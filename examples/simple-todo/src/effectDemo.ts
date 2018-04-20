import { annotateEffects } from 'typeful-redux';
import * as effects from 'redux-saga/effects';
import { store } from './todos';

const { put, take } = annotateEffects(store, effects);

function* demoSaga(): IterableIterator<never> {
    while (true) {
        take('CLEAR');
        put(
            store.actionCreators.ADD('see if we missed anything important')
        );
    }
}