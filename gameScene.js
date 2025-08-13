import Tile from "./lib/tile.js";
import Unit from "./lib/unit.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");

    this.players = ["Player 1", "AI 1", "AI 2"];
    this.turnIndex = 0;
    this.round = 1;

    this.turnText = null;
    this.endTurnBtn = null;

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
  }

  create() {
    const levelData = this.cache.json.get(this.level);

    const radius = 30;
    const hexWidth = Math.sqrt(3) * radius;
    const hexHeight = 2 * radius;

    const cols = levelData.cols;
    const rows = levelData.rows;

    const gridPixelWidth = hexWidth * cols + hexWidth / 2;
    const gridPixelHeight = hexHeight * 0.75 * rows + hexHeight / 4;

    const offsetX = (this.scale.width - gridPixelWidth) / 2;
    const offsetY = (this.scale.height - gridPixelHeight) / 2;

    for (const tileData of levelData.tiles) {
      const { q, r, color } = tileData;
      const tileColor = parseInt(color);
      const tile = new Tile(this, q, r, offsetX, offsetY, tileColor);

      this.tiles.set(`${q},${r}`, tile);

      const dz = this.add
        .zone(tile.x, tile.y, hexWidth * 0.9, hexHeight * 0.9)
        .setRectangleDropZone(hexWidth * 0.9, hexHeight * 0.9);

      dz.setData("tileObj", tile);
    }

    this.input.setTopOnly(true);

    this.createUnitTray();

    this.input.on("dragstart", (_pointer, sprite) => {
      sprite.setDepth(2000);

      const unit = sprite.unitObj;
      if (!unit) return;

      this.clearHighlightedTiles();

      const reachable = unit.getReachableTiles(this.tiles);
      reachable.forEach((tile) => {
        tile.setColor(0xffff66); // bright yellow highlight
        this.highlightedTiles.push(tile);
      });

      const boundTile = unit.boundTile;
      if (boundTile) {
        boundTile.unit = null;
        unit.boundTile = null;
      }
    });

    this.input.on("drag", (_pointer, sprite, dragX, dragY) => {
      sprite.x = dragX;
      sprite.y = dragY;
    });

    this.input.on("drop", (_pointer, sprite, dropZone) => {
      const unit = sprite.unitObj;
      if (!unit) {
        this.resetToStart(sprite);
        return;
      }

      const tile = dropZone.getData("tileObj");
      if (!tile) {
        this.resetToStart(sprite);
        return;
      }

      if (tile.unit) {
        this.resetToStart(sprite);
        return;
      }

      const reachable = unit.getReachableTiles(this.tiles);
      const canReach =
        reachable.includes(tile) || (tile.q === unit.q && tile.r === unit.r);
      if (!canReach) {
        this.resetToStart(sprite);
        return;
      }

      unit.moveToTile(tile);

      tile.unit = unit;
      unit.boundTile = tile;

      const ownerName = this.players[unit.ownerIndex];
      tile.setOwner(ownerName);
    });

    this.input.on("dragend", (_pointer, sprite, dropped) => {
      if (!dropped) this.resetToStart(sprite);
      sprite.setDepth(10);

      this.clearHighlightedTiles();
    });

    // HUD
    this.createTurnHud();
    this.renderTurnHud();

    this.input.keyboard.on("keydown-SPACE", () => this.advanceTurn());

    this.scale.on("resize", (size) => {
      const x = size.width - 260;
      if (this.turnText) this.turnText.setPosition(x, 20);
      if (this.endTurnBtn) this.endTurnBtn.setPosition(x, 92);
    });
  }

  createUnitTray() {
    const playerIndex = this.turnIndex;
    const trayX = 80;
    const startY = 80;
    const spacing = 60;

    for (let i = 0; i < 3; i++) {
      const unit = new Unit(this, null, null, "knight", playerIndex, 3);
      unit.sprite.x = trayX;
      unit.sprite.y = startY + i * spacing;

      unit.startX = unit.sprite.x;
      unit.startY = unit.sprite.y;

      this.units.push(unit);
    }
  }

  resetToStart(sprite) {
    const unit = sprite.unitObj;
    if (unit) {
      unit.resetPosition();
    } else {
      sprite.x = sprite.startX || sprite.x;
      sprite.y = sprite.startY || sprite.y;
    }
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

    const ownedTileCount = Array.from(this.tiles.values()).filter(
      (tile) => tile.owner === current
    ).length;
    
    const goldGained = ownedTileCount * 5; // Change income rate
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

    this.turnText.setText(`Round: ${this.round}\nCurrent: ${current}\nNext: ${next}`);
    this.goldText.setText(`Gold: ${gold}`);
  }
}