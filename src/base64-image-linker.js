export function base64ImageLinkerFactory( Utilities ) {
	return ( image ) => {
		const blob = image.getBlob();
		return `data:${ blob.getContentType() },${ Utilities.base64EncodeWebSafe( blob.getBytes() ) }`
	}
}