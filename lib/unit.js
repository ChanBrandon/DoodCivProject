export default class Unit {
  constructor(scene, q, r, textureKey, owner, id, movementRange = 1) {
    this.scene = scene;
    this.q = q;
    this.r = r;
    this.id = id;
    this.owner = owner;
    this.boundTile = null;
    this.moved = false;

    this.movementRange = movementRange;
    this.maxHealth = 100;
    this.health = 100;
    this.damage = 50;
    this.currentHealth = 100;
    this.attackRange = 1;

    // this.sprite.unitId = this.id; // sprite attaches to unit id
    //this.id = null;

    console.log(this.health);

    const { x, y } = this.axialToPixel(q, r, 30);
    this.sprite = scene.add
      .image(x, y, textureKey)
      .setScale(0.5)
      .setInteractive({ useHandCursor: true });
    this.sprite.setDepth(10);
    this.sprite.unitObj = this;
    /*
    this.sprite.on("pointerdown", (pointer) => {
      if (scene.selectedUnit && scene.selectedUnit !== this) {
        scene.selectedUnit.attack(this);
      } else {
        scene.selectedUnit = this;
      }
    });
    */

    scene.input.setDraggable(this.sprite);

    this.startX = x;
    this.startY = y;

    this.registerDragEvents();
    this.updateTint();
    //8000;
  }

  axialToPixel(q, r, radius) {
    const width = Math.sqrt(3) * radius;
    const x = width * (q + r / 2);
    const y = (3 / 2) * radius * r;
    return { x, y };
  }

  updateTint() {
    let alpha = this.currentHealth / 100;
    this.sprite.setAlpha(alpha);
  }

  registerDragEvents() {
    const scene = this.scene;

    this.sprite.on("dragstart", () => {
      if (this.moved) return;
      if (this.owner !== "Player 1") return;

      this.sprite.setDepth(2000);
      this.highlightReachableTiles();
    });

    this.sprite.on("drag", (_pointer, dragX, dragY) => {
      if (this.moved) return;
      if (this.owner !== "Player 1") return;

      const nearestTile = this.getNearestTile(dragX, dragY);
      const reachable = this.getReachableTiles(this.scene.tiles);

      if (
        nearestTile &&
        reachable.includes(nearestTile) &&
        (!nearestTile.unit || nearestTile.unit.owner !== this.owner)
      ) {
        this.sprite.x = nearestTile.x;
        this.sprite.y = nearestTile.y;
      } else {
        this.sprite.x = dragX;
        this.sprite.y = dragY;
      }
    });

    this.sprite.on("drop", (_pointer, dropZone) => {
      if (this.moved) return;
      if (this.owner !== "Player 1") return;

      const tile = dropZone.getData("tileObj");
      if (!tile) {
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

      if (tile.unit && tile.unit.owner !== this.owner) {
        const enemy = tile.unit;
        this.attack(enemy);

        if (enemy.currentHealth <= 0) {
          if (this.boundTile) {
            this.boundTile.unit = null;
          }
          this.moveToTile(tile);
        } else {
          this.resetPosition();
        }

        this.moved = true;
        //this.updateTint();
        this.sprite.setTint(0x888888);
        return;
      }

      if (tile.unit && tile.unit.owner === this.owner) {
        this.resetPosition();
        return;
      }

      if (this.boundTile) {
        this.boundTile.unit = null;
      }
      this.moveToTile(tile);
      this.moved = true;
      //this.updateTint();
      this.sprite.setTint(0x888888);
    });

    this.sprite.on("dragend", (_pointer, dropped) => {
      if (this.owner !== "Player 1") return;
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
      } else if (tile.unit.owner !== this.owner) {
        tile.setColor(0xff6666);
        this.scene.highlightedTiles.push(tile);
      }
    });
  }

  clearHighlights() {
    this.sprite.on("drop", (_pointer, dropZone) => {
      const tile = dropZone?.getData("tileObj");
      if (!tile || tile.unit) {
        return;
      }

      const reachable = this.getReachableTiles(this.scene.tiles);
      if (
        !reachable.includes(tile) &&
        !(tile.q === this.q && tile.r === this.r)
      ) {
        return;
      }

      this.moveToTile(tile);
    });
    this.scene.highlightedTiles.forEach((tile) =>
      tile.setColor(tile.baseColor),
    );
    this.scene.highlightedTiles = [];
  }

  incrementTurn() {
    this.moved = false;
    this.sprite.clearTint();
    //  this.updateTint();
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

  getAttackableTiles(allTilesMap) {
    const directions = [
      { dq: 1, dr: 0 },
      { dq: 1, dr: -1 },
      { dq: 0, dr: -1 },
      { dq: -1, dr: 0 },
      { dq: -1, dr: 1 },
      { dq: 0, dr: 1 },
    ];

    const attackable = new Set();
    const key = (q, r) => `${q},${r}`;

    const frontier = [{ q: this.q, r: this.r, dist: 0 }];
    const visited = new Set([key(this.q, this.r)]);

    while (frontier.length) {
      const current = frontier.shift();
      if (current.dist > this.attackRange) continue;

      const tile = allTilesMap.get(key(current.q, current.r));
      if (tile) attackable.add(tile);

      if (current.dist === this.attackRange) continue;

      for (const dir of directions) {
        const nq = current.q + dir.dq;
        const nr = current.r + dir.dr;
        const k = key(nq, nr);
        if (!visited.has(k) && allTilesMap.has(k)) {
          visited.add(k);
          frontier.push({ q: nq, r: nr, dist: current.dist + 1 });
        }
      }
    }

    return Array.from(attackable);
  }

  moveToTile(tile) {
    this.q = tile.q;
    this.r = tile.r;
    this.sprite.x = tile.x;
    this.sprite.y = tile.y;
    this.startX = tile.x;
    this.startY = tile.y;

    //  this.boundTile.unit = null;
    if (this.boundTile) {
      this.boundTile.unit = null;
    }

    tile.unit = this;
    this.boundTile = tile;
    tile.setOwner(this.owner);
  }

  resetPosition() {
    this.sprite.x = this.startX;
    this.sprite.y = this.startY;
  }

  attack(targetUnit) {
    console.log(targetUnit.currentHealth);
    if (!targetUnit || typeof targetUnit.currentHealth !== "number") {
      console.warn("Invalid targetUnit:", targetUnit);
      //return;
    }

    targetUnit.currentHealth -= this.damage;
    targetUnit.updateTint();

    if (targetUnit.currentHealth <= 0) {
      targetUnit.destroy();
    }

    this.scene.selectedUnit = null;
  }

  destroy() {
    if (this.boundTile) {
      this.boundTile.unit = null;
    }
    this.sprite.destroy();
  }
}

