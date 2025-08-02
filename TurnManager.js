class TurnManager {
  constructor(players) {
    this.players = players;
    this.currentIndex = 0;
    this.round = 1;
  }

  getCurrentPlayer() {
    return this.players[this.currentIndex];
  }

  nextTurn() {
    this.currentIndex = (this.currentIndex + 1) % this.players.length;
    if (this.currentIndex === 0) {
      this.round += 1; // New round
    }
  }

  doTurn(actionCallback) {
    const player = this.getCurrentPlayer();
    actionCallback(player);
    this.nextTurn();
  }
}

// Example Usage
const players = ['Player', 'AI1', 'AI2'];
const tm = new TurnManager(players);

// Simulate 5 turns
for (let i = 0; i < 5; i++) {
  tm.doTurn((player) => {
    console.log(`It's ${player}'s turn (Round ${tm.round})`);
  });
}
