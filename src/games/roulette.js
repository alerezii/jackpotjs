"use strict";

const { randInt } = require('../utils/helpers');

/**
 * RouletteGame
 * - spin(betsArray)
 *   betsArray: [{ userId, type, value, amount }]
 *   type: 'number' | 'color' | 'parity' | 'dozen'
 *
 * Devuelve { number, color, parity, dozen, results: [...] }
 * Cada resultado incluye payout (cantidad devuelta) y win boolean.
 */
class RouletteGame {
  constructor() {
    // colors for European wheel (0..36). 0 is green. Standard mapping
    this.redNumbers = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
  }

  spin(betsArray) {
    // betsArray -> evaluate
    const number = randInt(0, 36);
    const color = number === 0 ? 'green' : (this.redNumbers.has(number) ? 'red' : 'black');
    const parity = number === 0 ? 'none' : (number % 2 === 0 ? 'even' : 'odd');
    let dozen = 'none';
    if (number >= 1 && number <= 12) dozen = 1;
    else if (number >= 13 && number <= 24) dozen = 2;
    else if (number >= 25 && number <= 36) dozen = 3;

    const results = [];
    for (const b of betsArray) {
      const { userId, type, value, amount } = b;
      let win = false;
      let payout = 0; // amount returned including original bet when win
      let details = null;
      switch (type) {
        case 'number':
          if (typeof value !== 'number') {
            details = 'Invalid value for number bet';
            break;
          }
          if (value === number) {
            win = true;
            // Straight up: pays 35:1 + original bet = 36x
            payout = amount * 36;
          }
          break;
        case 'color':
          if (typeof value !== 'string') {
            details = 'Invalid value for color bet';
            break;
          }
          if (color === value) {
            win = true;
            payout = amount * 2; // 1:1 -> return 2x
          }
          break;
        case 'parity':
          if (typeof value !== 'string') {
            details = 'Invalid value for parity bet';
            break;
          }
          if (parity === value) {
            win = true;
            payout = amount * 2;
          }
          break;
        case 'dozen':
          if (typeof value !== 'number') {
            details = 'Invalid value for dozen bet';
            break;
          }
          if (dozen === value) {
            win = true;
            payout = amount * 3; // 2:1 -> return 3x
          }
          break;
        default:
          details = 'Unknown bet type';
      }
      results.push({ userId, type, value, amount, win, payout, details });
    }

    return {
      number,
      color,
      parity,
      dozen,
      results
    };
  }
}

module.exports = RouletteGame;
