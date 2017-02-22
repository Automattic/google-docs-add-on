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
	listSites,
	deleteSite,
	clearSiteData,
	include
} from './index'

global.onOpen = onOpen;
global.onInstall = onInstall;
global.showSidebar = showSidebar;
global.authCallback = authCallback;
global.postToWordPress = postToWordPress;
global.devTest = devTest;
global.listSites = listSites;
global.deleteSite = deleteSite;
global.clearSiteData = clearSiteData;
global.include = include;
