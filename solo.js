// ------------------ SOLO MODE ------------------
const soloBtn = document.getElementById('solo-btn');

let soloSecretWord = '';
let soloCurrentGuess = '';
let soloCurrentRowIndex = 0;
let soloTotalRows = 6;
let soloKeyStates = {};
let soloIsGameOver = false;
const SOLO_WORD_LENGTH = 5;

// Liste parole segrete e valide
const SECRET_WORDS_IT = ["AMORE","CUORE","FATTO","POLLO","PIANO","TRENO"];
const SECRET_WORDS_EN = ["APPLE","HOUSE","HEART","WORLD","WATER","MONEY","LIGHT","BRAVE","SMILE"];
const VALID_WORDS_IT =  ["AMORE","CUORE","FATTO","POLLO","PIANO","TRENO"];
const VALID_WORDS_EN =  ["APPLE","HOUSE","HEART","WORLD","WATER","MONEY","LIGHT","BRAVE","SMILE"];

// ------------------ EVENTI ------------------
soloBtn.addEventListener('click', () => {
    const selectedLanguage = document.getElementById('languageSelect').value;
    startSoloGame(selectedLanguage);
});

// ------------------ SOLITARIA ------------------
function startSoloGame(language = "it") {
    soloSecretWord = selectSoloSecretWord(language);
    soloCurrentGuess = '';
    soloCurrentRowIndex = 0;
    soloTotalRows = 6;
    soloKeyStates = {};
    soloIsGameOver = false;

    document.getElementById('lobby-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    document.getElementById('player-turn').textContent = "Your turn!";
    document.getElementById('game-message').textContent = '';

    generateGrid(1); // inizia con una sola riga
    generateKeyboard();
    enableSoloInput();

    console.log(`Solo mode started. Secret word: ${soloSecretWord}`);
}

function selectSoloSecretWord(language) {
    const list = language === "en" ? SECRET_WORDS_EN : SECRET_WORDS_IT;
    return list[Math.floor(Math.random() * list.length)].toUpperCase();
}

// ------------------ INPUT SOLO ------------------
function enableSoloInput() {
    document.addEventListener('keyup', soloKeyHandler);
}

function disableSoloInput() {
    document.removeEventListener('keyup', soloKeyHandler);
}

function soloKeyHandler(e) {
    if (soloIsGameOver) return;
    handleSoloKeyInput(e.key);
}

function handleSoloKeyInput(key) {
    const char = key.toUpperCase();

    if (char === 'ENTER') {
        submitSoloGuess();
    } else if (char === 'BACKSPACE' || char === 'DELETE') {
        soloCurrentGuess = soloCurrentGuess.slice(0, -1);
        document.getElementById('game-message').textContent = '';
    } else if (char.length === 1 && /^[A-Z]$/.test(char) && soloCurrentGuess.length < SOLO_WORD_LENGTH) {
        soloCurrentGuess += char;
        document.getElementById('game-message').textContent = '';
    }

    const rowBoxes = document.getElementById(`row-${soloCurrentRowIndex}`)?.querySelectorAll('.box');
    if (rowBoxes) {
        for (let i = 0; i < SOLO_WORD_LENGTH; i++) {
            rowBoxes[i].textContent = soloCurrentGuess[i] || '';
        }
    }
}

// ------------------ SUBMIT SOLO ------------------
function submitSoloGuess() {
    if (soloCurrentGuess.length !== SOLO_WORD_LENGTH) {
        document.getElementById('game-message').textContent = `The word should be ${SOLO_WORD_LENGTH} letters!`;
        return;
    }

    const guess = soloCurrentGuess.toUpperCase();

    if (!isValidSoloWord(guess)) {
        document.getElementById('game-message').textContent = "Not a valid word!";
        return;
    }

    const feedback = getSoloFeedback(guess, soloSecretWord);
    updateGridStateSolo(guess, feedback);

    const hasWon = feedback.every(f => f === 'correct-position');

    if (hasWon) {
        soloIsGameOver = true;
        document.getElementById('player-turn').textContent = "You won!";
        document.getElementById('game-message').textContent = `The word was: ${soloSecretWord}`;
        new Audio('audio/audio_win.mp3').play();
        createSoloRematchButton();
        disableSoloInput();
        return;
    }

    // ------------------ NUOVA RIGA DINAMICA ------------------
    if (soloCurrentRowIndex === soloTotalRows - 1) {
        addNewRow();
    }

    soloCurrentRowIndex++;
    soloCurrentGuess = '';
}

// ------------------ VALIDAZIONE PAROLE ------------------
function isValidSoloWord(word) {
    const language = document.getElementById('languageSelect').value;
    if (language === "en") return VALID_WORDS_EN.includes(word);
    return VALID_WORDS_IT.includes(word);
}

// ------------------ FEEDBACK ------------------
function getSoloFeedback(guess, secret) {
    const length = SOLO_WORD_LENGTH;
    const feedback = new Array(length).fill('not-in-word');
    let secretTemp = secret.split('');

    for (let i = 0; i < length; i++) {
        if (guess[i] === secret[i]) {
            feedback[i] = 'correct-position';
            secretTemp[i] = '#';
        }
    }

    for (let i = 0; i < length; i++) {
        if (feedback[i] === 'not-in-word') {
            const index = secretTemp.indexOf(guess[i]);
            if (index !== -1) {
                feedback[i] = 'wrong-position';
                secretTemp[index] = '#';
            }
        }
    }

    return feedback;
}

function updateGridStateSolo(word, feedback) {
    const rowElement = document.getElementById(`row-${soloCurrentRowIndex}`);
    if (!rowElement) return;
    const boxes = rowElement.querySelectorAll('.box');

    word.split('').forEach((letter, c) => {
        boxes[c].textContent = letter;
    });

    setTimeout(() => {
        feedback.forEach((f, c) => boxes[c].classList.add(f));
    }, 50 * soloCurrentRowIndex);

    updateKeyboardFeedbackSolo(word, feedback);
}

// ------------------ KEYBOARD ------------------
function generateKeyboard() {
    const rows = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['ENTER','Z','X','C','V','B','N','M','BACKSPACE']
    ];

    const keyboardContainer = document.getElementById('keyboard-container');
    keyboardContainer.innerHTML = '';

    rows.forEach(rowKeys => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';

        rowKeys.forEach(keyText => {
            const key = document.createElement('div');
            key.className = 'key';
            key.textContent = keyText;
            if (keyText === 'ENTER' || keyText === 'BACKSPACE') key.classList.add('wide-key');

            key.addEventListener('click', () => handleSoloKeyInput(keyText));

            rowDiv.appendChild(key);
            soloKeyStates[keyText] = soloKeyStates[keyText] || '';
        });

        keyboardContainer.appendChild(rowDiv);
    });
}

function updateKeyboardFeedbackSolo(word, feedback) {
    const letters = word.split('');
    letters.forEach((letter, index) => {
        const keyElement = document.getElementById(`key-${letter}`);
        if (!keyElement) return;

        const newClass = feedback[index];

        if (newClass === 'not-in-word') {
            keyElement.classList.remove('correct-position','wrong-position');
            keyElement.classList.add('not-in-word');
        } else {
            keyElement.classList.remove('not-in-word');
            keyElement.classList.add('correct-position');
        }
    });
}

// ------------------ REMATCH ------------------
function createSoloRematchButton() {
    const gameStatusDiv = document.getElementById('game-status');
    const rematchBtn = document.createElement('button');
    rematchBtn.textContent = 'Play Solo Again';
    rematchBtn.style.padding = '10px 20px';
    rematchBtn.style.marginTop = '15px';
    rematchBtn.style.cursor = 'pointer';

    rematchBtn.addEventListener('click', () => {
        gameStatusDiv.innerHTML = `<h3 id="player-turn">Your turn!</h3><p id="game-message"></p>`;
        generateGrid(soloTotalRows);
        generateKeyboard();
        startSoloGame(document.getElementById('languageSelect').value);
    });

    gameStatusDiv.appendChild(rematchBtn);
}

// ------------------ GRID ------------------
function generateGrid(rows) {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = '';
    soloTotalRows = rows;

    for (let r = 0; r < rows; r++) {
        addNewRow();
    }
}

function addNewRow() {
    const gridContainer = document.getElementById('grid-container');
    const r = gridContainer.children.length;
    const rowDiv = document.createElement('div');
    rowDiv.className = 'grid-row';
    rowDiv.id = `row-${r}`;

    for (let c = 0; c < SOLO_WORD_LENGTH; c++) {
        const boxDiv = document.createElement('div');
        boxDiv.className = 'box';
        boxDiv.id = `box-${r}-${c}`;
        rowDiv.appendChild(boxDiv);
    }

    gridContainer.appendChild(rowDiv);
    soloTotalRows = gridContainer.children.length;
}
