"use strict";

const { shuffle, clone } = require('../utils/helpers');

/**
 * BlackjackGame
 * - start(bet) : inicia la mano
 * - hit() : pide carta
 * - stand() : planta y resuelve dealer
 * - double() : dobla la apuesta (toma 1 carta y planta)
 * - getState() : devuelve estado intermedio en JSON
 * - getResult() : devuelve resultado final en JSON
 *
 * Nota: La clase NO gestiona balances. Devuelve objetos JSON con `payout` que el bot
 *       puede usar para ajustar el balance del usuario.
 */
class BlackjackGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.deck = [];
    this.player = [];
    this.dealer = [];
    this.bet = 0;
    this.state = 'idle'; // 'idle'|'player'|'dealer'|'finished'
    this.result = null;
  }

  // Crea baraja estándar de 52 cartas (rango: 2-10, J,Q,K=10, A=11/1)
  buildDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const deck = [];
    for (const s of suits) {
      for (const r of ranks) {
        deck.push({ rank: r, suit: s });
      }
    }
    return deck;
  }

  start(bet) {
    if (bet <= 0) throw new Error('Bet must be positive');
    this.reset();
    this.bet = bet;
    this.deck = shuffle(this.buildDeck());
    // deal
    this.player.push(this.deck.pop());
    this.dealer.push(this.deck.pop());
    this.player.push(this.deck.pop());
    this.dealer.push(this.deck.pop());
    this.state = 'player';
    this.result = null;
    // Immediate blackjack check
    const pVal = this.bestValue(this.player);
    const dVal = this.bestValue(this.dealer);
    if (pVal === 21 || dVal === 21) {
      this.resolveDealer();
    }
    return this.getState();
  }

  // calcula el mejor valor <=21 o el mínimo si bust
  bestValue(hand) {
    let values = [0];
    for (const c of hand) {
      const rank = c.rank;
      let addVals = [];
      if (rank === 'A') addVals = [1, 11];
      else if (['J','Q','K'].includes(rank)) addVals = [10];
      else addVals = [parseInt(rank, 10)];

      const newVals = [];
      for (const v of values) {
        for (const a of addVals) {
          newVals.push(v + a);
        }
      }
      values = newVals;
    }
    // elegir el mayor <=21 si hay, si no el menor (bust)
    const valid = values.filter(v => v <= 21);
    if (valid.length > 0) return Math.max(...valid);
    return Math.min(...values);
  }

  hit() {
    if (this.state !== 'player') throw new Error('Cannot hit now');
    this.player.push(this.deck.pop());
    const val = this.bestValue(this.player);
    if (val > 21) {
      this.state = 'finished';
      this.resolveDealer();
    }
    return this.getState();
  }

  double() {
    if (this.state !== 'player') throw new Error('Cannot double now');
    // Double only allowed if player has exactly 2 cards
    if (this.player.length !== 2) throw new Error('Double allowed only on first action');
    this.bet = this.bet * 2;
    this.player.push(this.deck.pop());
    this.state = 'finished';
    this.resolveDealer();
    return this.getState();
  }

  stand() {
    if (this.state !== 'player') throw new Error('Cannot stand now');
    this.state = 'dealer';
    this.resolveDealer();
    return this.getState();
  }

  resolveDealer() {
    // If already resolved, skip
    if (this.state === 'finished' && this.result) return;
    // Dealer draws until 17 (stand on soft 17)
    while (true) {
      const val = this.bestValue(this.dealer);
      // Simple stand on 17 or more
      if (val >= 17) break;
      this.dealer.push(this.deck.pop());
    }
    // Determine outcome
    const pVal = this.bestValue(this.player);
    const dVal = this.bestValue(this.dealer);
    const playerBlackjack = (this.player.length === 2 && pVal === 21);
    const dealerBlackjack = (this.dealer.length === 2 && dVal === 21);

    let outcome = 'lose';
    let payout = 0; // amount returned to player (includes original bet when >0)

    if (playerBlackjack && !dealerBlackjack) {
      outcome = 'blackjack';
      payout = this.bet * 2.5; // blackjack pays 3:2 -> total returned 2.5*bet? Clarify: original bet included -> we return bet*2.5
    } else if (dealerBlackjack && !playerBlackjack) {
      outcome = 'lose';
      payout = 0;
    } else if (pVal > 21) {
      outcome = 'bust';
      payout = 0;
    } else if (dVal > 21) {
      outcome = 'win';
      payout = this.bet * 2;
    } else if (pVal > dVal) {
      outcome = 'win';
      payout = this.bet * 2;
    } else if (pVal < dVal) {
      outcome = 'lose';
      payout = 0;
    } else {
      outcome = 'push';
      payout = this.bet; // return bet
    }

    this.state = 'finished';
    this.result = {
      outcome,
      payout,
      bet: this.bet,
      player: clone(this.player),
      dealer: clone(this.dealer),
      playerValue: pVal,
      dealerValue: dVal
    };
    return this.result;
  }

  getState() {
    return {
      state: this.state,
      bet: this.bet,
      player: clone(this.player),
      dealer: clone(this.dealer),
      playerValue: this.bestValue(this.player),
      dealerValue: this.bestValue(this.dealer),
      result: this.result ? clone(this.result) : null
    };
  }

  getResult() {
    if (this.state !== 'finished') {
      // ensure dealer resolves
      if (this.state !== 'idle') this.resolveDealer();
      else return null;
    }
    return clone(this.result);
  }
}

module.exports = BlackjackGame;
