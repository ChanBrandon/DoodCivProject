export default class Unit {
  constructor(scene, q, r, textureKey, owner, id) {
    this.scene = scene;
    this.q = q;
    this.r = r;
    this.id = id;
    this.owner = owner;
    this.boundTile = null;
    this.moved = false;

    this.initUnit();
    console.log("Creating unit", id, q, r, textureKey, owner);

    // this.sprite.unitId = this.id; // sprite attaches to unit id
    //this.id = null;

    const tile = scene.tiles.get(`${q},${r}`);
    if (!tile) {
      throw new Error('Tile not found at q:${q}, r:${r} when spawning unit');
    }
    this.boundTile = tile;
    tile.unit = this;

    this.sprite = scene.add
      .image(tile.x, tile.y, textureKey)
      .setScale(0.5)
      .setInteractive({ useHandCursor: true });

    this.sprite.setDepth(10);
    this.sprite.unitObj = this;

    scene.input.setDraggable(this.sprite);

    this.startX = tile.x;
    this.startY = tile.y;

    this.movementRange = 1;
    this.movesLeft = this.movementRange;

    this.registerDragEvents();
    //8000;
  }

  async init(name) {
    const res = await fetch(`http://localhost:3000/get_unit?unitName=${name}`);
    const unit = await res.json();
    this.movementRange = unit.move_range;
    this.maxHealth = unit.health;
    //this.health = unit.health;
    this.damage = unit.damage;
    this.currentHealth = unit.health;
    this.attackRange = unit.attack_range;
    this.movesLeft = this.movementRange;
    await fetch(
      `http://localhost:3000/initiate_unit?unitName=${name}&q_pos=${this.q}&r_pos=${this.r}&player=${this.owner}`,
    );
  }

  async initUnit() {
    await this.init(this.id);
    this.updateTint();
  }

  axialToPixel(q, r, radius) {
    const width = Math.sqrt(3) * radius;
    const x = width * (q + r / 2);
    const y = (3 / 2) * radius * r;
    return { x, y };
  }

  updateTint() {
    let alpha = this.currentHealth / this.maxHealth;
    this.sprite.setAlpha(alpha);
  }

  registerDragEvents() {
    const scene = this.scene;

    this.sprite.on("dragstart", () => {
      if (this.movesLeft <= 0) return;
      if (this.owner !== "Player 1") return;

      this.sprite.setDepth(2000);
      this.highlightReachableTiles();
    });

    this.sprite.on("drag", (_pointer, dragX, dragY) => {
      if (this.movesLeft <= 0) return;
      if (this.owner !== "Player 1") return;

      const nearestTile = this.getNearestTile(dragX, dragY);
      const reachable = this.getReachableTiles(this.scene.tiles);
      const attackable = this.getAttackableTiles(this.scene.tiles);

      if (
        nearestTile &&
        ((reachable.includes(nearestTile) && !nearestTile.unit) ||
          (attackable.includes(nearestTile) &&
            nearestTile.unit &&
            nearestTile.unit.owner !== this.owner))
      ) {
        this.sprite.x = nearestTile.x;
        this.sprite.y = nearestTile.y;
      } else {
        this.sprite.x = dragX;
        this.sprite.y = dragY;
      }
    });

    this.sprite.on("drop", (_pointer, dropZone) => {
      if (this.owner !== "Player 1") return;
      if (this.movesLeft <= 0) return;

      const tile = dropZone.getData("tileObj");
      if (!tile) {
        this.resetPosition();
        return;
      }

      const reachable = this.getReachableTiles(this.scene.tiles);
      const attackable = this.getAttackableTiles(this.scene.tiles);

      if (
        attackable.includes(tile) &&
        tile.unit &&
        tile.unit.owner !== this.owner
      ) {
        const enemy = tile.unit;
        this.attack(enemy);

        this.movesLeft = 0;
        this.sprite.setTint(0x888888);
        return;
      }

      if (tile.unit && tile.unit.owner === this.owner) {
        this.resetPosition();
        return;
      }

      if (reachable.includes(tile) && !tile.unit) {
        if (this.boundTile) this.boundTile.unit = null;
        this.resetPosition();
        this.moveToTile(tile);
        this.movesLeft--;
        //this.moved = true;
        if (this.movesLeft <= 0) {
          this.sprite.setTint(0x888888);
        }
        return;
      }

      this.resetPosition();
    });

    this.sprite.on("dragend", (pointer, dropped) => {
      if (this.owner !== "Player 1") return;

      const nearestTile = this.getNearestTile(this.sprite.x, this.sprite.y);
      const reachable = this.getReachableTiles(this.scene.tiles);

      if (!nearestTile || !reachable.includes(nearestTile)) {
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

    const attackable = this.getAttackableTiles(this.scene.tiles);
    attackable.forEach((tile) => {
      if (tile.unit && tile.unit.owner !== this.owner) {
        tile.setColor(0xff6666);
        this.scene.highlightedTiles.push(tile);
      }
    });
  }

  getDistance(a, b) {
    return (
      (Math.abs(a.q - b.q) +
        Math.abs(a.q + a.r - b.q - b.r) +
        Math.abs(a.r - b.r)) /
      2
    );
  }

  clearHighlights() {
    this.scene.highlightedTiles.forEach((tile) =>
      tile.setColor(tile.baseColor),
    );
    this.scene.highlightedTiles = [];
  }

  incrementTurn() {
    this.movesLeft = this.movementRange;
    //  this.moved = false;
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
      if (current.dist < 1) {
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

    if (this.boundTile) {
      this.boundTile.unit = null;
    }

    tile.unit = this;
    this.boundTile = tile;
    tile.setOwner(this.owner);

    this.scene.tweens.add({
      targets: this.sprite,
      x: tile.x,
      y: tile.y,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this.sprite.x = tile.x;
        this.sprite.y = tile.y;
        this.startX = tile.x;
        this.startY = tile.y;
      },
    });
  }

  resetPosition() {
    this.sprite.x = this.startX;
    this.sprite.y = this.startY;
  }

  attack(targetUnit) {
    if (!targetUnit || typeof targetUnit.currentHealth !== "number") return;

    const scene = this.scene;
    const targetX = targetUnit.sprite.x;
    const targetY = targetUnit.sprite.y;

    const homeX = this.boundTile ? this.boundTile.x : this.sprite.x;
    const homeY = this.boundTile ? this.boundTile.y : this.sprite.y;

    const oldDepth = this.sprite.depth;
    this.sprite.setDepth(999);

    scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      y: targetY,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        targetUnit.currentHealth -= this.damage;
        targetUnit.updateTint();

        const targetDestroyed = targetUnit.currentHealth <= 0;

        if (targetDestroyed) {
          targetUnit.destroy();
        } else {
          scene.tweens.add({
            targets: targetUnit.sprite,
            alpha: 0.5,
            duration: 80,
            yoyo: true,
            repeat: 1,
          });
        }

        const isAdjacent =
          Math.abs(this.q - targetUnit.q) <= 1 &&
          Math.abs(this.r - targetUnit.r) <= 1;

        let finalX = homeX;
        let finalY = homeY;

        if (targetDestroyed && isAdjacent) {
          if (this.boundTile) this.boundTile.unit = null;

          this.q = targetUnit.q;
          this.r = targetUnit.r;
          this.boundTile = targetUnit.boundTile;

          if (this.boundTile) {
            this.boundTile.unit = this;
            this.boundTile.setOwner(this.owner);
            finalX = this.boundTile.x;
            finalY = this.boundTile.y;
          }
        }

        scene.tweens.add({
          targets: this.sprite,
          x: finalX,
          y: finalY,
          duration: 200,
          ease: "Power2",
          onComplete: () => {
            this.sprite.setDepth(oldDepth);
            scene.selectedUnit = null;
          },
        });
      },
    });
  }

  destroy() {
    if (this.boundTile) {
      this.boundTile.unit = null;
    }
    this.sprite.destroy();
  }
}
