"use strict";

const { weightedChoice, clone } = require('../utils/helpers');

/**
 * SlotsGame
 * - constructor(config) : opcional para personalizar símbolos, pesos y paytable
 * - spin(bet) : realiza un giro y devuelve JSON { reels, win, payout, combination }
 *
 * Payouts: definidos en paytable como multiplicadores sobre la apuesta.
 */
class SlotsGame {
  constructor(config) {
    // Configurable symbols, weights and paytable
    const defaultSymbols = ['7', 'BAR', 'CHERRY', 'BELL', 'LEMON'];
    const defaultWeights = [1, 2, 5, 3, 6];
    const defaultPaytable = {
      '7': 100,
      'BAR': 50,
      'CHERRY': 20,
      'BELL': 10,
      'LEMON': 5
    };

    config = config || {};
    this.symbols = config.symbols || defaultSymbols;
    this.weights = config.weights || defaultWeights;
    this.paytable = config.paytable || defaultPaytable;

    // Ensure weights length matches symbols
    if (this.weights.length !== this.symbols.length) {
      // normalize: if mismatch, give equal weight
      this.weights = this.symbols.map(() => 1);
    }
  }

  spin(bet) {
    if (bet <= 0) throw new Error('Bet must be positive');
    // Generate 3 reels
    const reels = [];
    for (let i = 0; i < 3; i++) {
      const idx = weightedChoice(this.weights);
      reels.push(this.symbols[idx]);
    }

    // Evaluate combinations
    let win = false;
    let payout = 0;
    let combination = null;

    // Three of a kind
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      const sym = reels[0];
      const mult = this.paytable[sym] || 0;
      payout = bet * mult;
      win = payout > 0;
      combination = { type: 'three', symbol: sym, multiplier: mult };
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
      // Two of a kind: smaller payout (10% of three-of-a-kind for that symbol)
      let sym = reels[0] === reels[1] ? reels[0] : (reels[1] === reels[2] ? reels[1] : reels[0]);
      const mult = Math.max(1, Math.floor((this.paytable[sym] || 0) * 0.1));
      payout = bet * mult;
      win = payout > 0;
      combination = { type: 'two', symbol: sym, multiplier: mult };
    } else {
      // No match -> maybe special for CHERRY anywhere -> small payout
      if (reels.includes('CHERRY')) {
        const mult = 1; // minimal reward
        payout = bet * mult;
        win = true;
        combination = { type: 'single', symbol: 'CHERRY', multiplier: mult };
      }
    }

    return {
      reels: clone(reels),
      win,
      payout,
      combination
    };
  }
}

module.exports = SlotsGame;
