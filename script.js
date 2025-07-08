import confetti from 'canvas-confetti';

document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.getElementById('buttons');
    const calculatorDiv = document.getElementById('calculator');
    const cheatSheetDiv = document.getElementById('cheat-sheet');
    const cheatImage = document.getElementById('cheat-image');
    const imageUpload = document.getElementById('image-upload');
    const backToCalcBtn = document.getElementById('back-to-calc-btn');

    let currentInput = '0';
    let operator = null;
    let firstOperand = null;
    let shouldResetDisplay = false;

    let secretCodeSequence = [];
    const SECRET_CODE = ['*', '/', '+', '-'];
    let cheatModeActive = false;

    function updateDisplay() {
        display.textContent = currentInput;
        // Adjust font size for long numbers
        if (currentInput.length > 9) {
            display.classList.add('display-text-small');
            display.classList.remove('display-text-xsmall');
        } else if (currentInput.length > 12) {
            display.classList.add('display-text-xsmall');
             display.classList.remove('display-text-small');
        }
        else {
            display.classList.remove('display-text-small', 'display-text-xsmall');
        }
    }

    function calculate() {
        const first = parseFloat(firstOperand);
        const second = parseFloat(currentInput);
        if (isNaN(first) || isNaN(second)) return;

        let result;
        switch (operator) {
            case '+': result = first + second; break;
            case '-': result = first - second; break;
            case '*': result = first * second; break;
            case '/': 
                if (second === 0) {
                    currentInput = "Error";
                    updateDisplay();
                    return;
                }
                result = first / second; 
                break;
            default: return;
        }
        currentInput = String(result);
        operator = null;
        firstOperand = null;
        shouldResetDisplay = true;
        updateDisplay();
        if (currentInput === '1337') {
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        }
    }
    
    function resetCalculator() {
        currentInput = '0';
        operator = null;
        firstOperand = null;
        shouldResetDisplay = false;
        secretCodeSequence = [];
        updateDisplay();
    }

    function toggleCheatSheet(show) {
        cheatModeActive = show;
        calculatorDiv.classList.toggle('hidden', show);
        cheatSheetDiv.classList.toggle('hidden', !show);
        if (show && !cheatImage.src) {
             // Only trigger upload if no image is set yet
            imageUpload.click();
        }
    }
    
    function handleKeyPress(key) {
        if (cheatModeActive) {
            if (key === 'clear') {
                toggleCheatSheet(false);
                resetCalculator();
            }
            return;
        }

        secretCodeSequence.push(key);
        if (secretCodeSequence.length > SECRET_CODE.length) {
            secretCodeSequence.shift();
        }
        if (JSON.stringify(secretCodeSequence) === JSON.stringify(SECRET_CODE)) {
            toggleCheatSheet(true);
            secretCodeSequence = [];
            return;
        }

        if ('0123456789'.includes(key)) {
            if (currentInput === '0' || shouldResetDisplay) {
                currentInput = key;
                shouldResetDisplay = false;
            } else {
                currentInput += key;
            }
        } else if (key === '.') {
            if (shouldResetDisplay) {
                currentInput = '0.';
                shouldResetDisplay = false;
            } else if (!currentInput.includes('.')) {
                currentInput += '.';
            }
        } else if ('+-*/'.includes(key)) {
            if (operator !== null && !shouldResetDisplay) {
                calculate();
            }
            firstOperand = currentInput;
            operator = key;
            shouldResetDisplay = true;
        } else if (key === '=') {
            if (operator !== null) {
                calculate();
            }
        } else if (key === 'clear') {
            resetCalculator();
        } else if (key === 'backspace') {
            if (shouldResetDisplay) return;
            currentInput = currentInput.slice(0, -1) || '0';
        }
        
        updateDisplay();
    }

    buttons.addEventListener('click', (event) => {
        const { key } = event.target.dataset;
        if (key) {
            handleKeyPress(key);
        }
    });

    backToCalcBtn.addEventListener('click', () => {
        toggleCheatSheet(false);
        resetCalculator();
    });

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                cheatImage.src = e.target.result;
                if (!cheatModeActive) {
                    toggleCheatSheet(true);
                }
            };
            reader.readAsDataURL(file);
        } else {
             // If user cancels file selection, go back to calculator
             toggleCheatSheet(false);
        }
    });

    // Initialize display
    updateDisplay();
});