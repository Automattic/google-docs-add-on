// HACK HACK HACK but it's either this or write a custom HTML generator?
export function exportAsHtml() {
	var forDriveScope = DriveApp.getStorageUsed(); //needed to get Drive Scope requested
	var docID = DocumentApp.getActiveDocument().getId();
	var url = "https://docs.google.com/feeds/download/documents/export/Export?id=" + docID + "&exportFormat=html";
	var param = {
		method: "get",
		headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
		muteHttpExceptions: true,
	};
	var html = UrlFetchApp.fetch(url, param).getContentText();
	return html;
}
