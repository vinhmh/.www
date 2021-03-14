import { applyMiddleware, createStore, compose } from 'redux'
import thunk from 'redux-thunk'
import socketMessageMiddleware from './middleware/socketMessage'
import reducers from './reducers'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk, socketMessageMiddleware)))

export default store
