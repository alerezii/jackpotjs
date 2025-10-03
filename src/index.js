"use strict";

// Exporta todas las clases de juegos
// Uso:
// const { BlackjackGame, RouletteGame, SlotsGame } = require('jackpotjs');

const BlackjackGame = require('./games/blackjack');
const RouletteGame = require('./games/roulette');
const SlotsGame = require('./games/slots');

module.exports = {
  BlackjackGame,
  RouletteGame,
  SlotsGame
};
