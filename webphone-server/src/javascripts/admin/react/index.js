import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import Monitor from './containers/Monitor'
import Switcher from './containers/Switcher'

const monitorNode = document.getElementById('monitor')
if(monitorNode) {
  const layout = (
    <Provider store={store}>
      <Monitor />
    </Provider>
  )
  ReactDOM.render(layout, monitorNode);
}

const switcherNode = document.getElementById('switcher')
if(switcherNode) {
  const layout = (
    <Provider store={store}>
      <Switcher />
    </Provider>
  )
  ReactDOM.render(layout, switcherNode);
}

