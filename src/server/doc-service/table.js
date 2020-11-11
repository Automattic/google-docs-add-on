import { getCommentDelimitedContent } from './block';

export function Table(renderContainer, renderBlocks = true) {
	function renderTableRow(row) {
		let tRow = '<tr>';
		const cells = [];
		const numCells = row.getNumCells();
		let cellContent = '';
		for (let i = 0; i < numCells; i++) {
			cellContent = renderContainer(row.getCell(i), false);
			tRow += '<td>' + cellContent + '</td>';
			cells.push(cellContent);
		}
		tRow += '</tr>';
		return { tRow, cells };
	}

	return function renderTable(table) {
		const numRows = table.getNumRows();
		const rows = [];
		let tBody = '<table><tbody>';
		for (let i = 0; i < numRows; i++) {
			let { tRow, cells } = renderTableRow(table.getRow(i));
			tBody += tRow;
			rows.push(cells);
		}
		const content = tBody + '</tbody></table>';
		if (renderBlocks) {
			const attributes = { body: rows };
			return getCommentDelimitedContent( 'core/table', attributes, content ) + '\n';
		}

		return content;
	};
}
