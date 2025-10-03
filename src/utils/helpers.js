"use strict";

// Funciones utilitarias compartidas

/** Devuelve un entero aleatorio entre min y max (incluidos) */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Baraja un array in-place usando Fisher-Yates y lo devuelve */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/** Elige un índice según pesos (array de números >=0). Devuelve índice. */
function weightedChoice(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}

/** Clona profundamente un objeto JSON-simple */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  randInt,
  shuffle,
  weightedChoice,
  clone
};
