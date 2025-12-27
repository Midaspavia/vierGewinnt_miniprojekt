// connect4.js

// 6 Zeilen x 7 Spalten, '' = leer, 'r' = rot, 'b' = blau
let state = Array(6).fill('').map(() => Array(7).fill(''));
let currentPlayer = 'r'; // 'r' oder 'b'
let gameOver = false;

// Undo-History (Praktikum 13): speichert frühere Zustände
// Jeder Eintrag ist ein Objekt: { state, currentPlayer, gameOver }
let history = [];

function cloneState(s) {
    // tiefes Kopieren (6x7)
    return s.map(row => row.slice());
}

function pushHistory() {
    history.push({
        state: cloneState(state),
        currentPlayer,
        gameOver
    });
}

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

// LocalStorage (Praktikum 11/13)
const STORAGE_KEY = "connect4-save-v1";

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
            // Zustand vor dem Zug merken (für Undo)
            pushHistory();
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
    history = []; // Undo-Stack zurücksetzen
    state = Array(6).fill('').map(() => Array(7).fill(''));
    currentPlayer = 'r';
    gameOver = false;
    showBoard();
}

// Undo: letzten Zug rückgängig machen (mehrfach möglich)
function undoMove() {
    if (history.length === 0) {
        const status = document.getElementById("status");
        if (status) status.textContent = "Nichts zum Rückgängig machen.";
        return;
    }

    const prev = history.pop();
    state = prev.state;
    currentPlayer = prev.currentPlayer;
    gameOver = prev.gameOver;

    showBoard();
}

// Spielstand im Browser speichern
function saveGame() {
    const data = {
        state,
        currentPlayer,
        gameOver,
        history
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    const status = document.getElementById("status");
    if (status) status.textContent = "Spielstand gespeichert.";
}

// Spielstand aus dem Browser laden
function loadGame() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const status = document.getElementById("status");

    if (!raw) {
        if (status) status.textContent = "Kein gespeicherter Spielstand gefunden.";
        return;
    }

    try {
        const data = JSON.parse(raw);

        // Validierung
        if (!isValidBoard(data.state)) {
            throw new Error("Ungültiges state-Format");
        }

        if (data.currentPlayer !== 'r' && data.currentPlayer !== 'b') {
            throw new Error("Ungültiger currentPlayer");
        }

        if (typeof data.gameOver !== 'boolean') {
            throw new Error("Ungültiger gameOver-Wert");
        }

        // History ist optional: wenn vorhanden und gültig -> übernehmen, sonst leeren
        if (data.history && isValidHistory(data.history)) {
            history = data.history;
        } else {
            history = [];
        }

        state = data.state;
        currentPlayer = data.currentPlayer;
        gameOver = data.gameOver;

        showBoard();
    } catch (e) {
        if (status) status.textContent = "Fehler beim Laden des Spielstands.";
    }
}

// Event-Handler registrieren
window.addEventListener("load", () => {
    const boardEl = document.querySelector('.board');
    boardEl.addEventListener('click', handleBoardClick);

    const btnNew = document.getElementById('new-game');
    if (btnNew) {
        btnNew.addEventListener('click', newGame);
    }

    const btnSave = document.getElementById('save-game');
    const btnLoad = document.getElementById('load-game');

    if (btnSave) btnSave.addEventListener('click', saveGame);
    if (btnLoad) btnLoad.addEventListener('click', loadGame);

    // Optionaler Undo-Button (falls du ihn im HTML ergänzt)
    const btnUndo = document.getElementById('undo');
    if (btnUndo) btnUndo.addEventListener('click', undoMove);

    // Tastenkürzel: Ctrl+Z / Cmd+Z für Undo
    window.addEventListener('keydown', (e) => {
        const z = (e.key === 'z' || e.key === 'Z');
        const modifier = e.ctrlKey || e.metaKey;
        if (modifier && z) {
            e.preventDefault();
            undoMove();
        }
    });

    showBoard();
});