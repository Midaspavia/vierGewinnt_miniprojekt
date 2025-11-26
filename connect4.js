// connect4.js
console.log("connect4.js geladen");

// 6 Zeilen x 7 Spalten, '' = leer, 'r' = rot, 'b' = blau
let state = Array(6).fill('').map(() => Array(7).fill(''));
let currentPlayer = 'r'; // 'r' oder 'b'
let gameOver = false;

// Gewinnerfunktion (aus deiner Node-Version adaptiert)
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

// Hilfsfunktion für CSS-Klasse
function colorClass(player) {
    return player === 'r' ? 'red' : 'blue';
}

// SJDON für das gesamte Board erzeugen
function boardToSJDON(board) {
    const nodes = [];

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = board[row][col];

            const children = [];

            if (cell === 'r' || cell === 'b') {
                children.push([
                    "div",
                    { class: "piece " + colorClass(cell) }
                ]);
            }

            nodes.push([
                "div",
                {
                    class: "field",
                    "data-row": row,
                    "data-col": col
                },
                ...children
            ]);
        }
    }

    return nodes;
}

function updateStatus() {
    const status = document.getElementById("status");
    if (!status) return;

    if (gameOver) {
        // currentPlayer IST der Gewinner
        status.textContent =
            (currentPlayer === 'r' ? "Rot" : "Blau") +
            " hat gewonnen! Neues Spiel starten?";
    } else {
        status.textContent =
            (currentPlayer === 'r' ? "Rot" : "Blau") +
            " ist am Zug.";
    }
}

// Board rendern (View)
function showBoard() {
    const boardEl = document.querySelector('.board');
    boardEl.innerHTML = '';

    const sjdonFields = boardToSJDON(state);
    sjdonFields.forEach(node => renderSJDON(node, boardEl));

    updateStatus();
}

// Klick auf Brett: Stein in Spalte fallen lassen
function handleBoardClick(event) {
    if (gameOver) return;

    const field = event.target.closest('.field');
    if (!field) return;

    const col = Number(field.dataset.col);

    // Unterstes freies Feld in dieser Spalte suchen
    for (let row = 5; row >= 0; row--) {
        if (!state[row][col]) {
            state[row][col] = currentPlayer;

            // Gewonnen?
            if (connect4Winner(currentPlayer, state)) {
                gameOver = true;
            } else {
                // Spieler wechseln
                currentPlayer = currentPlayer === 'r' ? 'b' : 'r';
            }

            showBoard();
            return;
        }
    }

    // Spalte voll -> nichts tun
}

// Neues Spiel
function newGame() {
    state = Array(6).fill('').map(() => Array(7).fill(''));
    currentPlayer = 'r';
    gameOver = false;
    showBoard();
}

// Event-Handler registrieren
window.addEventListener("load", () => {
    const boardEl = document.querySelector('.board');
    boardEl.addEventListener('click', handleBoardClick);

    const btnNew = document.getElementById('new-game');
    if (btnNew) {
        btnNew.addEventListener('click', newGame);
    }

    // Buttons Speichern/Laden sind schon im HTML,
    // kannst du später anbinden (save/load).

    showBoard();
});