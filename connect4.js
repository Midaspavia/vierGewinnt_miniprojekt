console.log("connect4.js geladen");

const ROWS = 6;
const COLS = 7;

// Spielzustand (Model)
let state = {
    board: Array.from({ length: ROWS }, () => Array(COLS).fill('')), // '' | 'r' | 'b'
    nextPlayer: 'r', // 'r' oder 'b'
    gameOver: false
};

const boardEl = document.querySelector('.board');
const statusEl = document.getElementById('status');

const DATA_KEY = 'connect4'; // Schlüssel für Server-Storage

// ---------- Hilfsfunktionen ----------

function emptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(''));
}

function resetState() {
    state.board = emptyBoard();
    state.nextPlayer = 'r';
    state.gameOver = false;
    showBoard();
    updateStatus();
}

function updateStatus(message) {
    if (!statusEl) return;

    if (message) {
        statusEl.textContent = message;
    } else if (state.gameOver) {
        statusEl.textContent = 'Spiel beendet';
    } else {
        statusEl.textContent = state.nextPlayer === 'r'
            ? 'Rot ist am Zug'
            : 'Blau ist am Zug';
    }
}

// ---------- Board zeichnen (View) ----------

function showBoard() {
    boardEl.innerHTML = '';

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const value = state.board[row][col]; // '', 'r', 'b'
            const field = elt('div', {
                class: 'field',
                'data-row': row,
                'data-col': col
            });

            if (value === 'r' || value === 'b') {
                const colorClass = value === 'r' ? 'red' : 'blue';
                const piece = elt('div', { class: `piece ${colorClass}` });
                field.appendChild(piece);
            }

            boardEl.appendChild(field);
        }
    }
}

// ---------- Klick-Handling ----------

function handleBoardClick(event) {
    if (state.gameOver) return;

    const field = event.target.closest('.field');
    if (!field || !boardEl.contains(field)) return;

    const col = parseInt(field.dataset.col, 10);
    if (Number.isNaN(col)) return;

    // Unterstes freies Feld in dieser Spalte finden
    let targetRow = -1;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!state.board[row][col]) {
            targetRow = row;
            break;
        }
    }

    // Spalte voll → Klick ignorieren
    if (targetRow === -1) {
        return;
    }

    const current = state.nextPlayer;
    state.board[targetRow][col] = current;
    showBoard();

    if (connect4Winner(current, state.board)) {
        state.gameOver = true;
        const winnerName = current === 'r' ? 'Rot' : 'Blau';
        updateStatus(`${winnerName} hat gewonnen!`);
        return;
    }

    // Spieler wechseln
    state.nextPlayer = current === 'r' ? 'b' : 'r';
    updateStatus();
}

// ---------- Gewinnprüfung (auch für Abgabe verwendbar) ----------

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

// ---------- Server-Kommunikation (Praktikum 10) ----------

async function saveGame() {
    try {
        const response = await fetch(`/api/data/${DATA_KEY}?api-key=c4game`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state)
        });

        if (!response.ok) {
            throw new Error(`HTTP-Fehler ${response.status}`);
        }

        alert('Spielstand gespeichert.');
    } catch (err) {
        console.error(err);
        alert('Fehler beim Speichern des Spielstands.');
    }
}

async function loadGame() {
    try {
        const response = await fetch(`/api/data/${DATA_KEY}?api-key=c4game`);

        if (!response.ok) {
            throw new Error(`HTTP-Fehler ${response.status}`);
        }

        const data = await response.json();

        if (data && Array.isArray(data.board)) {
            state.board = data.board;
            state.nextPlayer = data.nextPlayer || 'r';
            state.gameOver = !!data.gameOver;
            showBoard();
            updateStatus();
        } else {
            alert('Kein gültiger Spielstand auf dem Server.');
        }
    } catch (err) {
        console.error(err);
        alert('Fehler beim Laden des Spielstands.');
    }
}

// ---------- Initialisierung ----------

document.addEventListener('DOMContentLoaded', () => {
    boardEl.addEventListener('click', handleBoardClick);

    const newGameBtn = document.getElementById('new-game');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', resetState);
    }

    const saveBtn = document.getElementById('save-game');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveGame);
    }

    const loadBtn = document.getElementById('load-game');
    if (loadBtn) {
        loadBtn.addEventListener('click', loadGame);
    }

    resetState();
});