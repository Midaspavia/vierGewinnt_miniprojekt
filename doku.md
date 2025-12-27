# Vier gewinnt – Webbasierte Entwicklung (Praktikum 13)

## Autor
- **Midas Pavia Dominguez**

## Projektbeschreibung
Dieses Projekt ist eine browserbasierte Implementierung des Spiels **Vier gewinnt**.
Das Spiel wurde im Rahmen der Praktika im Modul *WBE* umgesetzt.

Der Fokus lag auf:
- sauberer Trennung von **State (Model)**, **Rendering (View)** und **Event-Handling (Controller)**
- eigener Rendering-Library (SJDON)
- Persistenz mittels `localStorage`
- Undo-Funktionalität

---

## Funktionsübersicht

### Grundfunktionen
- 6×7 Spielfeld
- Zwei Spieler: **Rot** und **Blau**
- Steine fallen korrekt nach unten (Schwerkraft)
- Kein Überschreiben belegter Felder
- Automatischer Spielerwechsel

### Spielende
- Erkennung von vier Steinen in einer Reihe:
    - horizontal
    - vertikal
    - diagonal (↘, ↙)
- Nach Spielende sind keine weiteren Züge möglich
- Anzeige des Gewinners

### Rendering
- Eigene Render-Funktion `renderSJDON`
- Spielfeld wird vollständig aus dem aktuellen Spielzustand neu gerendert
- Kein direktes DOM-Bauen im Spielcode

### Undo (mehrfach)
- Beliebig viele Züge können rückgängig gemacht werden
- Undo per Button oder per Tastenkürzel **Ctrl/Cmd + Z**
- Undo funktioniert auch nach Laden eines Spielstands

### Speichern & Laden
- Spielstand wird im Browser via `localStorage` gespeichert
- Gespeichert werden:
    - Spielfeld (`state`)
    - aktueller Spieler
    - Spielstatus (`gameOver`)
    - Undo-History
- Nach dem Laden kann das Spiel korrekt fortgesetzt werden

---

## Technische Hinweise
- Implementierung ausschließlich mit **HTML, CSS und JavaScript**
- Keine externen Libraries
- Keine Node.js-spezifischen Konstrukte im Browser-Code
- Kompatibel mit aktuellen Desktop-Browsern

---
