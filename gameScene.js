import Tile from "./lib/tile.js";
import UnitTray from "./lib/unitTray.js";
import Unit from "./lib/unit.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");

    this.Unit = Unit;

    this.players = ["Player 1"];
    this.turnIndex = 0;
    this.round = 1;

    this.turnText = null;
    this.endTurnBtn = null;
    this.goldText = null;

    this.tiles = new Map();
    this.units = [];

    this.highlightedTiles = [];

    this.playerGold = {
      "Player 1": 100,
      "AI 1": 100,
      "AI 2": 100,
    };
  }

  init(data) {
    this.level = data.level;
  }

  preload() {
    this.load.json("level1", "assets/levels/level1.json");
    this.load.json("level2", "assets/levels/level2.json");
    this.load.json("level3", "assets/levels/level3.json");

    this.load.image("knight", "assets/knight.png");
    this.load.image("lancer", "assets/lancer.png");
  }

  async create() {
    const levelData = this.cache.json.get(this.level);

    // Reset players table when loading new level
    await fetch("http://localhost:3000/clear_table?name=players");

    // Add players to array according to level data
    for (let i = 1; i < levelData.num_enemies + 1; i++) {
      this.players.push("AI " + i.toString());
    }

    // Add players to database
    for (let player_name of this.players) {
      await fetch("http://localhost:3000/add_player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: player_name })
      })
    }

    const radius = 30;
    const hexWidth = Math.sqrt(3) * radius;
    const hexHeight = 2 * radius;

    const cols = levelData.cols;
    const rows = levelData.rows;

    const gridPixelWidth = hexWidth * cols + hexWidth / 2;
    const gridPixelHeight = hexHeight * 0.75 * rows + hexHeight / 4;

    const offsetX = (this.scale.width - gridPixelWidth) / 2;
    const offsetY = (this.scale.height - gridPixelHeight) / 2;

    const playerColors = {
      "Player 1": 0x3377cc,
      "AI 1": 0xd2042d,
      "AI 2": 0xcc3333,
    };

    // Create tiles and assign ownership based on color
    for (const tileData of levelData.tiles) {
      const { q, r, color } = tileData;
      const tileColor = parseInt(color);
      const tile = new Tile(this, q, r, offsetX, offsetY, tileColor);

      for (const [playerName, playerColor] of Object.entries(playerColors)) {
        if (tileColor === playerColor) {
          tile.setOwner(playerName);
          break;
        }
      }

      this.tiles.set(`${q},${r}`, tile);

      const dz = this.add
        .zone(tile.x, tile.y, hexWidth * 0.9, hexHeight * 0.9)
        .setRectangleDropZone(hexWidth * 0.9, hexHeight * 0.9);

      dz.setData("tileObj", tile);
    }

    this.input.setTopOnly(true);

    this.createUnitTray();

    // HUD
    this.createTurnHud();
    this.renderTurnHud();

    this.input.keyboard.on("keydown-SPACE", () => this.advanceTurn());

    this.scale.on("resize", (size) => {
      const x = size.width - 260;
      if (this.turnText) this.turnText.setPosition(x, 20);
      if (this.endTurnBtn) this.endTurnBtn.setPosition(x, 92);
      if (this.goldText) this.goldText.setPosition(x, 160);
    });
  }

  createUnitTray() {
    console.log("unit tray!");

    new UnitTray(this, 80, 80, "knight", "Player 1", Unit);
  }

  clearHighlightedTiles() {
    this.highlightedTiles.forEach((tile) => {
      tile.setColor(tile.baseColor);
    });
    this.highlightedTiles = [];
  }

  currentPlayer() {
    return this.players[this.turnIndex];
  }

  nextPlayer() {
    return this.players[(this.turnIndex + 1) % this.players.length];
  }

  advanceTurn() {
    const current = this.currentPlayer();

    for (let unit of this.units) {
      if (unit.owner == current) {
        unit.moved = false;
      }
    }

    const ownedTileCount = Array.from(this.tiles.values()).filter(
      (tile) => tile.owner === current,
    ).length;

    const goldGained = ownedTileCount * 5;
    this.playerGold[current] += goldGained;

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

    this.goldText = this.add
      .text(x, 160, "", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "16px",
        color: "#ffd700",
        backgroundColor: "#444",
        padding: { x: 12, y: 8 },
      })
      .setDepth(1000)
      .setScrollFactor(0);
  }

  renderTurnHud() {
    const current = this.currentPlayer();
    const next = this.nextPlayer();
    const gold = this.playerGold["Player 1"];

    this.turnText.setText(
      `Round: ${this.round}\nCurrent: ${current}\nNext: ${next}`,
    );
    this.goldText.setText(`Gold: ${gold}`);
  }
}
