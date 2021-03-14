import 'url-search-params-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import App from './components/App'

const MOUNT_NODE = document.getElementById('root')
const layout = <Provider store={store}><App /></Provider>

if (MOUNT_NODE) ReactDOM.render(layout, MOUNT_NODE)
