# JackpotJS

Motor de lógica para juegos de azar (Blackjack, Ruleta, Slots). Esta librería solo maneja la lógica y devuelve resultados en JSON; no gestiona balances ni persistencia. Está pensada para integrarse en bots o aplicaciones (p. ej. Discord bots).

## Instalación

`npm install jackpotjs`

## Contenido

- `src/index.js` - exporta las clases públicas
- `src/games/blackjack.js` - `BlackjackGame`
- `src/games/roulette.js` - `RouletteGame`
- `src/games/slots.js` - `SlotsGame`
- `src/utils/helpers.js` - helpers (shuffle, randInt, weightedChoice, etc.)

## Uso básico (Node)

```js
const { BlackjackGame, RouletteGame, SlotsGame } = require('jackpotjs');

// Blackjack (ejemplo síncrono)

const bj = new BlackjackGame();
bj.start(10); // inicia partida con apuesta 10
bj.hit();
bj.stand();
console.log(bj.getResult());

// Ruleta
const roulette = new RouletteGame();
const bets = [
  { userId: 'u1', type: 'number', value: 17, amount: 5 },
  { userId: 'u2', type: 'color', value: 'red', amount: 2 }
];
console.log(roulette.spin(bets));

// Slots
const slots = new SlotsGame();
console.log(slots.spin(5));
```

## Uso en un bot (ejemplo para Discord)

- El bot debe validar el balance del usuario antes de llamar a estas funciones.
- Llama a los métodos, recibe el JSON de resultado y actualiza la base de datos del usuario en consecuencia.

Ejemplo (simplificado):

```js
// pseudo-código
const result = slots.spin(10);
if (result.payout > 0) {
  // incrementar balance: +result.payout
} else {
  // restar apuesta
}
```

## Formato de salida

Cada juego devuelve objetos JSON con detalles suficientes para que el bot calcule ganancias/perdidas y muestre información al usuario.

- Blackjack: `getState()` devuelve manos, totales y estado; `getResult()` devuelve resultado final con `outcome` y `payout`.
- Roulette: `spin(betsArray)` devuelve `{ number, color, parity, dozen, results: [...] }`.
- Slots: `spin(bet)` devuelve `{ reels, win, payout, combination }`.

## Diseño y notas

- Sin dependencias externas.
- Código modular y documentado.
- Listo para utilizar en tus proyectos.
