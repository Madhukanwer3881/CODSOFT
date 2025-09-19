/* script.js - simple safe calculator behavior */

const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let current = ''; // expression shown
let lastResult = null;

function updateDisplay(text) {
  display.textContent = text === '' ? '0' : text;
}

/* Validate expression: only allow digits, operators, parentheses, dot and percent & spaces */
function isSafeExpression(expr){
  // allow numbers, spaces, () . % and + - * /
  return /^[0-9+\-*/().%\s]+$/.test(expr);
}

/* Convert percent:  "50%" => "(50/100)" when evaluating */
function transformPercent(expr){
  // replace occurrences like 50% or )% with ( /100)
  // We'll convert X% => (X/100)
  return expr.replace(/(\d+(\.\d+)?)(?=%)/g, '($1/100)');
}

function evaluateExpression(expr) {
  if (!expr) return '';
  if (!isSafeExpression(expr)) throw new Error('Invalid characters in expression');

  const transformed = transformPercent(expr);

  // replace any unicode division/multiply signs if present
  const sanitized = transformed.replace(/÷/g, '/').replace(/×/g, '*');

  // Use Function constructor but only after validation above
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${sanitized})`)();
    if (result === Infinity || result === -Infinity || Number.isNaN(result)) throw new Error('Math error');
    return +parseFloat(result.toFixed(10)); // trim floating noise
  } catch (e) {
    throw new Error('Calculation error');
  }
}

/* Button handling */
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.value;
    const action = btn.dataset.action;

    if (action === 'clear') {
      current = '';
      lastResult = null;
      updateDisplay('');
      return;
    }

    if (action === 'delete') {
      current = current.slice(0, -1);
      updateDisplay(current);
      return;
    }

    if (action === 'equals') {
      try {
        const res = evaluateExpression(current);
        lastResult = String(res);
        updateDisplay(lastResult);
        current = lastResult; // allow chaining
      } catch (err) {
        updateDisplay('Error');
        current = '';
      }
      return;
    }

    // regular value button
    if (val) {
      // avoid multiple dots in a row like "1.."
      current += val;
      updateDisplay(current);
    }
  });
});

/* Keyboard support */
window.addEventListener('keydown', (e) => {
  const key = e.key;

  if ((/^[0-9]$/).test(key)) {
    current += key;
    updateDisplay(current);
    return;
  }

  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    try {
      const res = evaluateExpression(current);
      lastResult = String(res);
      updateDisplay(lastResult);
      current = lastResult;
    } catch {
      updateDisplay('Error');
      current = '';
    }
    return;
  }

  if (key === 'Backspace') {
    current = current.slice(0, -1);
    updateDisplay(current);
    return;
  }

  if (key === 'Escape') {
    current = '';
    updateDisplay('');
    return;
  }

  if (['+', '-', '*', '/', '.', '%', '(', ')'].includes(key)) {
    current += key;
    updateDisplay(current);
  }
});
