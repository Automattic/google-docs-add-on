export function Table( renderContainer ) {
	function renderTableRow( row ) {
		let tRow = '<tr>';
		const numCells = row.getNumCells();
		for ( let i = 0; i < numCells; i++ ) {
			tRow += '<td>'
			+ renderContainer( row.getCell( i ) )
			+ '</td>';
		}
		return tRow + '</tr>'
	}

	return function renderTable( table ) {
		const numRows = table.getNumRows();
		let tBody = '<table><tbody>'
		for ( let i = 0; i < numRows; i++ ) {
			tBody += renderTableRow( table.getRow( i ) )
		}
		return tBody + '</tbody></table>'
	}
}
