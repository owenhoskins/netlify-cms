import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as notifReducer } from 'redux-notifications';
import optimist from 'redux-optimist';
import reducers from '.';
import { reducer as uppyReducer } from 'uppy/lib/store/ReduxStore';

export default optimist(combineReducers({
  ...reducers,
  uppy: uppyReducer,
  notifs: notifReducer,
  routing: routerReducer,
}));
