import Tile from "./lib/tile.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");

    this.players = ["Player 1", "AI 1", "AI 2"];
    this.turnIndex = 0;
    this.round = 1;
    //HUD Refs
    this.turnText = null;
    this.endTurnBtn = null;
  }

  preload() {
    this.load.json("level1", "assets/levels/level1.json");
  }

  create() {
    const levelData = this.cache.json.get("level1");

    this.tiles = [];
    const radius = 30;
    const hexWidth = Math.sqrt(3) * radius;
    const hexHeight = 2 * radius;

    const cols = levelData.cols;
    const rows = levelData.rows;

    const gridPixelWidth = hexWidth * cols + hexWidth / 2;
    const gridPixelHeight = hexHeight * 0.75 * rows + hexHeight / 4;

    const offsetX = (this.sys.game.config.width - gridPixelWidth) / 2;
    const offsetY = (this.sys.game.config.height - gridPixelHeight) / 2;

    for (const tileData of levelData.tiles) {
      const { q, r, color } = tileData;
      const tileColor = parseInt(color);
      const tile = new Tile(this, q, r, offsetX, offsetY, tileColor);
      this.tiles.push(tile);
    }

    this.createTurnHud();
    this.renderTurnHud();

    this.input.keyboard.on("keydown-SPACE", () => this.advanceTurn());

    this.scale.on("resize", (size) => {
      const x = size.width - 260;
      if (this.turnText) this.turnText.setPosition(x, 20);
      if (this.endTurnBtn) this.endTurnBtn.setPosition(x, 92);
    });
  }

  currentPlayer() {
    return this.players[this.turnIndex];
  }

  nextPlayer() {
    return this.players[(this.turnIndex + 1) % this.players.length];
  }

  advanceTurn() {
    this.turnIndex = (this.turnIndex + 1) % this.players.length;
    if (this.turnIndex === 0) this.round += 1;
    this.renderTurnHud();
  }

  createTurnHud() {
    const x = this.scale.width - 260;

    this.turnText = this.add
      .text(x, 20, "", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#262c44",
        padding: { x: 12, y: 8 },
        align: "left",
      })
      .setDepth(1000)
      .setScrollFactor(0);

    this.endTurnBtn = this.add
      .text(x, 92, "End Turn (Space)", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#2370aa",
        padding: { x: 12, y: 8 },
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.advanceTurn())
      .setDepth(1000)
      .setScrollFactor(0);
  }

  renderTurnHud() {
    this.turnText.setText(
      " Round: ${this.round}\nCurrent: ${this.currentPlayer()}\nNext: ${this.nextPlayer()}",
    );
  }
}
