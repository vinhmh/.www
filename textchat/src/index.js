import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import App from './containers/App'
import 'semantic-ui-css/semantic.min.css'
import '../vendor/stylesheets/style.scss'


const MOUNT_NODE = document.getElementById('root')
const layout = <Provider store={store}><App /></Provider>

if (MOUNT_NODE) ReactDOM.render(layout, MOUNT_NODE)
