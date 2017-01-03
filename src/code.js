/**
 * This is for the gas-webpack-plugin to explicitly expose functions to GAS
 */

import {
	onOpen,
	onInstall,
	showSidebar,
	authCallback,
	postToWordPress,
	devTest,
	listSites
} from './index'

global.onOpen = onOpen;
global.onInstall = onInstall;
global.showSidebar = showSidebar;
global.authCallback = authCallback;
global.postToWordPress = postToWordPress;
global.devTest = devTest;
global.listSites = listSites;
