/* global Utilities */

export default const base64ImageLinkerFactory = ( Utilities) => ( image ) => {
	const blob = image.getBlob();
	return `data:${ blob.getContentType() },${ Utilities.base64EncodeWebSafe( blob.getBytes() ) }`
}