export default class Unit {
  constructor(scene, q, r, textureKey, owner, movementRange = 1) {
    this.scene = scene;
    this.q = q;
    this.r = r;
    this.owner = owner;
    this.movementRange = movementRange;
    this.boundTile = null;
    this.moved = false;
    this.health = 100;
    this.damage = 10;

    console.log;

    const { x, y } = this.axialToPixel(q, r, 30);
    this.sprite = scene.add
      .image(x, y, textureKey)
      .setScale(0.5)
      .setInteractive({ useHandCursor: true });
    this.sprite.setDepth(10);
    this.sprite.unitObj = this;

    scene.input.setDraggable(this.sprite);

    this.startX = x;
    this.startY = y;

    this.registerDragEvents();
  }

  axialToPixel(q, r, radius) {
    const width = Math.sqrt(3) * radius;
    const x = width * (q + r / 2);
    const y = (3 / 2) * radius * r;
    return { x, y };
  }

  registerDragEvents() {
    const scene = this.scene;

    this.sprite.on("dragstart", () => {
      if (this.moved) return;
      this.sprite.setDepth(2000);
      this.highlightReachableTiles();
    });

    this.sprite.on("drag", (_pointer, dragX, dragY) => {
      if (this.moved) return;

      const nearestTile = this.getNearestTile(dragX, dragY);

      if (nearestTile && !nearestTile.unit) {
        this.sprite.x = nearestTile.x;
        this.sprite.y = nearestTile.y;
      } else {
        this.sprite.x = dragX;
        this.sprite.y = dragY;
      }
    });

    this.sprite.on("drop", (_pointer, dropZone) => {
      if (this.moved) return;

      const tile = dropZone.getData("tileObj");

      if (!tile || tile.unit) {
        this.resetPosition();
        return;
      }

      const reachable = this.getReachableTiles(this.scene.tiles);
      if (
        !reachable.includes(tile) &&
        !(tile.q === this.q && tile.r === this.r)
      ) {
        this.resetPosition();
        return;
      }

      this.boundTile.unit = null;

      this.moveToTile(tile);
      tile.unit = this;
      this.boundTile = tile;
      tile.setOwner(this.owner);
      this.moved = true;
    });

    this.sprite.on("dragend", (_pointer, dropped) => {
      if (!this.boundTile) {
        this.resetPosition();
      }
      this.sprite.setDepth(10);
      this.clearHighlights();
    });
  }

  getNearestTile(x, y) {
    let closestTile = null;
    let minDist = Infinity;

    this.scene.tiles.forEach((tile) => {
      const dx = tile.x - x;
      const dy = tile.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closestTile = tile;
      }
    });

    return minDist < 40 ? closestTile : null;
  }

  highlightReachableTiles() {
    this.clearHighlights();
    const reachable = this.getReachableTiles(this.scene.tiles);
    reachable.forEach((tile) => {
      if (!tile.unit) {
        tile.setColor(0xffff66);
        this.scene.highlightedTiles.push(tile);
      }
    });
  }

  clearHighlights() {
    this.sprite.on("drop", (_pointer, dropZone) => {
      const tile = dropZone?.getData("tileObj");
      if (!tile || tile.unit) {
        // Invalid drop: do not set boundTile
        return;
      }

      const reachable = this.getReachableTiles(scene.tiles);
      if (
        !reachable.includes(tile) &&
        !(tile.q === this.q && tile.r === this.r)
      ) {
        return;
      }

      // Valid move
      this.moveToTile(tile);
      tile.unit = this;
      this.boundTile = tile;
      tile.setOwner(scene.players[this.ownerIndex]);
    });
    this.scene.highlightedTiles.forEach((tile) =>
      tile.setColor(tile.baseColor),
    );
    this.scene.highlightedTiles = [];
  }

  incrementTurn() {
    this.moved = false;
  }

  getReachableTiles(allTilesMap) {
    let visited = new Set();
    let frontier = [{ q: this.q, r: this.r, dist: 0 }];
    let reachable = [];
    const key = (q, r) => `${q},${r}`;
    visited.add(key(this.q, this.r));

    const directions = [
      { dq: 1, dr: 0 },
      { dq: 1, dr: -1 },
      { dq: 0, dr: -1 },
      { dq: -1, dr: 0 },
      { dq: -1, dr: 1 },
      { dq: 0, dr: 1 },
    ];

    while (frontier.length) {
      const current = frontier.shift();
      if (current.dist < this.movementRange) {
        for (let dir of directions) {
          const nq = current.q + dir.dq;
          const nr = current.r + dir.dr;
          const k = key(nq, nr);
          if (!visited.has(k) && allTilesMap.has(k)) {
            visited.add(k);
            frontier.push({ q: nq, r: nr, dist: current.dist + 1 });
            reachable.push(allTilesMap.get(k));
          }
        }
      }
    }
    return reachable;
  }

  moveToTile(tile) {
    this.q = tile.q;
    this.r = tile.r;
    this.sprite.x = tile.x;
    this.sprite.y = tile.y;
    this.startX = tile.x;
    this.startY = tile.y;
  }

  resetPosition() {
    this.sprite.x = this.startX;
    this.sprite.y = this.startY;
  }
}
