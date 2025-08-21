import Unit from "./unit.js";

export default class EnemyAI {
  constructor(scene, name = "Enemy AI") {
    this.scene = scene;
    this.name = name;
    this.units = [];
    this.gold = 50;

    this.unitCost = 20;
    this.unitType = "warrior";
  }

  addUnit(unit) {
    this.units.push(unit);
    unit.owner = this.name;
  }

  takeTurn() {
    this.tryToBuyUnits();

    for (const unit of this.units) {
      if (unit.moved || unit.health <= 0) continue;

      const enemiesInRange = this.getEnemyUnitsInRange(unit);
      console.log(enemiesInRange);
      if (enemiesInRange.length > 0) {
        const target = enemiesInRange[0];
        console.log(`${this.name} attacks ${target.id}`);
        unit.attack(target);
        unit.moved = true;
        continue;
      }

      const neutralTile = this.findNearestNeutralTile(unit);
      if (neutralTile) {
        this.moveAndClaim(unit, neutralTile);
        continue;
      }

      const enemyTile = this.findNearestEnemyTile(unit);
      if (enemyTile) {
        this.advanceToward(unit, enemyTile);
        //continue;
      }

      this.wander(unit);
    }
  }

  newTurn() {
    this.units.forEach((u) => u.incrementTurn());
    const income = Array.from(this.scene.tiles.values()).filter(
      (t) => t.owner === this.name,
    ).length;
    this.gold += income;
    console.log(`${this.name} has ${this.gold} gold`);
  }

  tryToBuyUnits() {
    if (this.gold < this.unitCost) return;

    const ownedTiles = Array.from(this.scene.tiles.values()).filter(
      (t) => t.owner === this.name && !t.unit,
    );

    console.log("trying to buy unit");

    if (ownedTiles.length === 0) return;

    const spawnTile = Phaser.Utils.Array.GetRandom(ownedTiles);
    const newUnit = new Unit(
      this.scene,
      spawnTile.q,
      spawnTile.r,
      this.unitType,
      this.name,
    );

    spawnTile.unit = newUnit;
    newUnit.boundTile = spawnTile;
    newUnit.moveToTile(spawnTile);

    this.addUnit(newUnit);
    this.scene.units.push(newUnit);

    this.gold -= this.unitCost;
    console.log(
      `${this.name} bought a ${this.unitType} on (${spawnTile.q}, ${spawnTile.r})`,
    );
  }

  moveAndClaim(unit, tile) {
    if (!tile) return;
    unit.moveToTile(tile);
    tile.unit = unit;
    tile.setOwner(this.name);
    unit.boundTile = tile;
    unit.moved = true;
  }

  wander(unit) {
    if (unit.moved) return;
    console.log("wondering");

    const reachable = unit.getReachableTiles(this.scene.tiles);
    const valid = reachable.filter((t) => !t.unit);
    if (valid.length > 0) {
      const randTile = Phaser.Utils.Array.GetRandom(valid);
      this.moveAndClaim(unit, randTile);
    }
  }

  advanceToward(unit, enemyTile) {
    const reachable = unit.getReachableTiles(this.scene.tiles);
    if (reachable.length === 0) return;

    let bestTile = null;
    let minDist = Infinity;

    for (const tile of reachable) {
      if (tile.unit) continue;
      const dx = enemyTile.q - tile.q;
      const dy = enemyTile.r - tile.r;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        bestTile = tile;
      }
    }

    if (bestTile) {
      this.moveAndClaim(unit, bestTile);
    }
  }

  findNearestNeutralTile(unit) {
    let minDist = Infinity;
    let nearest = null;
    this.scene.tiles.forEach((tile) => {
      if (!tile.owner && !tile.unit) {
        const dx = tile.q - unit.q;
        const dy = tile.r - unit.r;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          nearest = tile;
        }
      }
    });
    return nearest;
  }

  findNearestEnemyTile(unit) {
    let minDist = Infinity;
    let nearest = null;
    for (const other of this.scene.units) {
      if (other.owner === this.name || other.health <= 0) continue;
      if (!other.boundTile) continue;
      const dx = other.boundTile.q - unit.q;
      const dy = other.boundTile.r - unit.r;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = other.boundTile;
      }
    }
    return nearest;
  }

  getEnemyUnitsInRange(unit) {
    const enemies = [];
    const directions = [
      { dq: 1, dr: 0 },
      { dq: 1, dr: -1 },
      { dq: 0, dr: -1 },
      { dq: -1, dr: 0 },
      { dq: -1, dr: 1 },
      { dq: 0, dr: 1 },
    ];

    for (let dir of directions) {
      for (let step = 1; step <= unit.attackRange; step++) {
        const nq = unit.q + dir.dq * step;
        const nr = unit.r + dir.dr * step;
        const tile = this.scene.tiles.get(`${nq},${nr}`);

        console.log("finding tile");

        if (!tile) continue; // skip invalid hex

        console.log("valid tile");

        if (tile.unit) {
          console.log("found unit");
          if (tile.unit.owner !== this.name) {
            console.log("enenmy unit!");
          }
        }
        if (
          tile.unit &&
          tile.unit.owner !== this.name &&
          tile.unit.health > 0
        ) {
          enemies.push(tile.unit);
        }
      }
    }

    return enemies;
  }

  chooseAttackTarget(enemies) {
    // heuristic: attack lowest health
    return enemies.reduce(
      (weakest, e) => (!weakest || e.health < weakest.health ? e : weakest),
      null,
    );
  }
}
