import Tile from "./lib/tile.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
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
      const tileColor = parseInt(color); // Convert from "0x88cc88" string to number
      const tile = new Tile(this, q, r, offsetX, offsetY, tileColor);
      this.tiles.push(tile);
    }
  }
}
