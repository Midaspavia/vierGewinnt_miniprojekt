function isValidCell(v) {
    return v === '' || v === 'r' || v === 'b';
}

function isValidBoard(b) {
    return Array.isArray(b) &&
        b.length === 6 &&
        b.every(row => Array.isArray(row) && row.length === 7 && row.every(isValidCell));
}

function isValidHistory(h) {
    return Array.isArray(h) && h.every(entry =>
        entry &&
        isValidBoard(entry.state) &&
        (entry.currentPlayer === 'r' || entry.currentPlayer === 'b') &&
        typeof entry.gameOver === 'boolean'
    );
}