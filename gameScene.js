import Tile from "./lib/tile.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  create() {
    //TODO maybe have each level be a json file that contains title data???

    this.tiles = [];
    const radius = 30;
    const cols = 10;
    const rows = 10;
    const hexWidth = Math.sqrt(3) * radius;
    const hexHeight = 2 * radius;
    const gridPixelWidth = hexWidth * cols + hexWidth / 2;
    const gridPixelHeight = hexHeight * 0.75 * rows + hexHeight / 4;

    const offsetX = (this.sys.game.config.width - gridPixelWidth) / 2;
    const offsetY = (this.sys.game.config.height - gridPixelHeight) / 2;

    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        const tile = new Tile(this, q, r, offsetX, offsetY, 0x88cc88);
        this.tiles.push(tile);
      }
    }
  }
}
