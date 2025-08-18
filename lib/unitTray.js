export default class UnitTray {
  constructor(scene, x, y, textureKey, ownerIndex, UnitClass) {
    this.scene = scene;
    this.sprite = scene.add
      .image(x, y, textureKey)
      .setScale(0.5)
      .setInteractive({ useHandCursor: true });
    this.sprite.setDepth(20);

    this.sprite.startX = x;
    this.sprite.startY = y;

    this.ownerIndex = ownerIndex;
    this.UnitClass = UnitClass;
    this.textureKey = textureKey;
    this.unit = null;

    this.scene.input.setDraggable(this.sprite);
    this.registerDragEvents();
  }

  registerDragEvents() {
    const scene = this.scene;

    this.sprite.on("dragstart", () => {
      this.sprite.setDepth(2000);
      this.highlightValidTiles();
    });

    this.sprite.on("drag", (_pointer, dragX, dragY) => {
      const nearestTile = this.getNearestValidTile(dragX, dragY);
      if (nearestTile) {
        this.sprite.x = nearestTile.x;
        this.sprite.y = nearestTile.y;
      } else {
        this.sprite.x = dragX;
        this.sprite.y = dragY;
      }
    });

    this.sprite.on("drop", () => {
      const nearestTile = this.getNearestValidTile(
        this.sprite.x,
        this.sprite.y,
      );

      if (nearestTile) {
        const unit = new this.UnitClass(
          scene,
          nearestTile.q,
          nearestTile.r,
          this.textureKey,
          this.ownerIndex,
        );

        unit.moveToTile(nearestTile);

        nearestTile.unit = unit;
        unit.boundTile = nearestTile;
        scene.units.push(unit);

        unit.id = unit.id
        unit.health = unit.initialHealth;
        unit.range = unit.attackRange;
        unit.sprite.setName("unit-" + unit.id);
      }

      this.sprite.x = this.sprite.startX;
      this.sprite.y = this.sprite.startY;
      this.sprite.setDepth(20);

      this.clearHighlights();
    });

    this.sprite.on("dragend", () => {
      this.sprite.x = this.sprite.startX;
      this.sprite.y = this.sprite.startY;
      this.sprite.setDepth(20);
      this.clearHighlights();
    });
  }

  highlightValidTiles() {
    this.validTiles = Array.from(this.scene.tiles.values()).filter(
      (tile) => tile.owner === this.ownerIndex && !tile.unit,
    );

    this.validTiles.forEach((tile) => tile.setColor(0xffff66));
    this.scene.highlightedTiles.push(...this.validTiles);
  }

  clearHighlights() {
    if (!this.validTiles) return;
    this.validTiles.forEach((tile) => tile.setColor(tile.baseColor));
    this.scene.highlightedTiles = [];
    this.validTiles = [];
  }

  getNearestValidTile(x, y) {
    if (!this.validTiles || this.validTiles.length === 0) return null;

    let nearest = null;
    let minDist = Infinity;

    this.validTiles.forEach((tile) => {
      const dist = Phaser.Math.Distance.Between(x, y, tile.x, tile.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = tile;
      }
    });

    const radius = 30;
    if (minDist <= (Math.sqrt(3) * radius) / 2) return nearest;
    return null;
  }
}
