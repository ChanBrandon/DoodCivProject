export default class UnitTray {
  constructor(scene, x, y, textureKey, ownerIndex, UnitClass, id) {
    this.scene = scene;

    this.sprite = scene.add
      .image(x, y, textureKey)
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setInteractive({ useHandCursor: true });

    this.sprite.setDepth(20);

    this.sprite.startX = x;
    this.sprite.startY = y;

    this.ownerIndex = ownerIndex;
    this.UnitClass = UnitClass;
    this.textureKey = textureKey;
    this.unit = null;
    this.id = id;

    this.cost = null;
    this.affordable = true;

    this.scene.input.setDraggable(this.sprite, true);

    this.fetchCost();
    this.registerDragEvents();
  }

  async fetchCost() {
    const unitType = this.id || this.textureKey;
    try {
      const response = await fetch(
        `http://localhost:3000/get_unit?unitName=${unitType}`,
      );
      const data = await response.json();
      this.cost = data.cost;
    } catch (err) {
      console.error("Failed to fetch unit cost:", err);
    }
  }

  setAffordable(canAfford) {
    this.affordable = canAfford;

    if (canAfford) {
      this.sprite.clearTint();
    } else {
      this.sprite.setTint(0x555555);
    }
  }

  registerDragEvents() {
    const scene = this.scene;

    this.sprite.on("dragstart", (pointer) => {
      if (!this.affordable) {
        this.sprite.x = this.sprite.startX;
        this.sprite.y = this.sprite.startY;
        this.sprite.setDepth(20);
        return;
      }

      this.sprite.setDepth(2000);
      this.highlightValidTiles();
      this.sprite.setOrigin(0.5);
    });

    this.sprite.on("drag", (pointer, dragX, dragY) => {
      if (!this.affordable) return;

      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      this.sprite.setOrigin(0.5);

      const nearestTile = this.getNearestValidTile(worldX, worldY);
      if (nearestTile) {
        this.sprite.x = nearestTile.x;
        this.sprite.y = nearestTile.y;
      } else {
        this.sprite.x = worldX;
        this.sprite.y = worldY;
      }
    });

    this.sprite.on("drop", (pointer) => {
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;

      const playerGold = this.scene.playerGold;
      if (playerGold < this.cost) {
        return;
      }

      const nearestTile = this.getNearestValidTile(worldX, worldY);

      if (nearestTile) {
        const unit = new this.UnitClass(
          this.scene,
          nearestTile.q,
          nearestTile.r,
          this.textureKey,
          this.ownerIndex,
          this.id,
        );

        unit.moveToTile(nearestTile);
        nearestTile.unit = unit;
        unit.boundTile = nearestTile;

        this.scene.units.push(unit);
        unit.sprite.setName("unit-" + unit.id);

        this.scene.playerGold -= this.cost;
        console.log(
          `Player ${this.ownerIndex} bought ${this.id || this.textureKey} for ${this.cost} gold`,
        );
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

    console.log("nerarest tile!");
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
