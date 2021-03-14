import { applyMiddleware, createStore, compose } from 'redux'
import thunk from 'redux-thunk'
import socketEventMiddleware from './middleware/socketEvent'
import appMiddleware from './middleware/app'
import reducers from './reducers'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk, socketEventMiddleware, appMiddleware)))

export default store
