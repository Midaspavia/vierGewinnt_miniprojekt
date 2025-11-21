function connect4Winner(player, board) {
    const rows = board.length;
    const cols = board[0]?.length || 0;
    const directions = [
        [0, 1],  // horizontal →
        [1, 0],  // vertikal ↓
        [1, 1],  // diagonal ↘
        [1, -1]  // diagonal ↙
    ];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== player) continue;

            for (const [dr, dc] of directions) {
                let count = 1;
                let r = row + dr;
                let c = col + dc;

                while (
                    r >= 0 && r < rows &&
                    c >= 0 && c < cols &&
                    board[r][c] === player
                    ) {
                    count++;
                    if (count >= 4) {
                        return true;
                    }
                    r += dr;
                    c += dc;
                }
            }
        }
    }

    return false;
}

module.exports = { connect4Winner };