import { combineReducers } from 'redux';
import activity from './activityReducer.js';
import account from './accountReducer.js';
import admin from './adminReducer.js';

import ui from './uiReducer.js';

export default combineReducers({
    ui,
    activity,
    admin,
    account
});
