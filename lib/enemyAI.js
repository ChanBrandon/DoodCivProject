import Unit from "./unit.js";

export default class EnemyAI {
  constructor(scene, name = "Enemy AI") {
    this.scene = scene;
    this.name = name;
    this.units = [];
    this.gold = 100;

    this.teir1Units = ["warrior", "scout", "slinger"];
    this.currentTeir = 1;
  }

  addUnit(unit) {
    this.units.push(unit);
    unit.owner = this.name;
  }

  newTurn() {
    this.units.forEach((u) => u.incrementTurn());
    const ownedTileCount = Array.from(this.scene.tiles.values()).filter(
      (t) => t.owner === this.name,
    ).length;
    this.gold += ownedTileCount * 5;
    console.log(`${this.name} has ${this.gold} gold`);
  }

  async takeTurn() {
    await this.tryToBuyUnits();

    for (const unit of this.units) {
      if (unit.moved || unit.currentHealth <= 0) continue;

      // attack
      const enemiesInRange = this.getEnemyUnitsInRange(unit);
      if (enemiesInRange.length > 0) {
        const target = this.chooseAttackTarget(enemiesInRange);
        //console.log(`${this.name} attacks ${target.id}`);
        unit.attack(target);
        unit.moved = true;
        continue;
      }

      // move towards enemy
      const enemyTile = this.findNearestEnemyTile(unit);
      if (enemyTile) {
        this.advanceToward(unit, enemyTile);
        continue;
      }

      // claim neutral tile
      const neutralTile = this.findNearestNeutralTile(unit);
      if (neutralTile) {
        this.moveAndClaim(unit, neutralTile);
        continue;
      }

      // wonder randomnly
      this.wander(unit);
    }
  }

  async tryToBuyUnits() {
    let possibleUnits = [...this.teir1Units];

    while (possibleUnits.length > 0) {
      const unitType = Phaser.Utils.Array.GetRandom(possibleUnits);

      try {
        const response = await fetch(
          `http://localhost:3000/get_unit?unitName=${unitType}`,
        );
        const data = await response.json();
        const unitCost = data.cost;
        console.log(`${unitType} costs ${unitCost} gold`);

        if (this.gold >= unitCost) {
          const ownedTiles = Array.from(this.scene.tiles.values()).filter(
            (t) => t.owner === this.name && !t.unit,
          );

          if (ownedTiles.length === 0) return;

          const spawnTile = Phaser.Utils.Array.GetRandom(ownedTiles);
          const newUnit = new Unit(
            this.scene,
            spawnTile.q,
            spawnTile.r,
            unitType,
            this.name,
          );

          spawnTile.unit = newUnit;
          newUnit.boundTile = spawnTile;
          newUnit.moveToTile(spawnTile);

          this.addUnit(newUnit);
          this.scene.units.push(newUnit);

          this.gold -= unitCost;
          console.log(
            `${this.name} bought a ${unitType} on (${spawnTile.q},${spawnTile.r}) for ${unitCost} gold`,
          );

          return;
        }
      } catch (err) {
        console.error("Failed to fetch unit cost:", err);
      }

      possibleUnits = possibleUnits.filter((u) => u !== unitType);
    }

    console.log(`${this.name} cannot afford any tier 1 units`);
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
    const reachable = unit.getReachableTiles(this.scene.tiles);
    const valid = reachable.filter((t) => !t.unit);
    if (valid.length > 0) {
      const randTile = Phaser.Utils.Array.GetRandom(valid);
      this.moveAndClaim(unit, randTile);
    }
  }

  advanceToward(unit, targetTile) {
    console.log("move");

    const reachable = unit.getReachableTiles(this.scene.tiles);
    if (reachable.length === 0) return;

    let bestTile = null;
    let minDist = Infinity;

    for (const tile of reachable) {
      if (tile.unit) continue;
      const dx = targetTile.q - tile.q;
      const dy = targetTile.r - tile.r;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        bestTile = tile;
      }
    }

    if (bestTile) this.moveAndClaim(unit, bestTile);
  }

  findNearestEnemyTile(unit) {
    let minDist = Infinity;
    let nearest = null;
    for (const other of this.scene.units) {
      if (other.owner === this.name || other.currentHealth <= 0) continue;
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

  getEnemyUnitsInRange(unit) {
    const attackableTiles = unit.getAttackableTiles(this.scene.tiles);

    return this.scene.units.filter((other) => {
      if (other.owner === this.name) return false;
      if (other.currentHealth <= 0) return false;
      if (!other.boundTile) return false;

      return attackableTiles.includes(other.boundTile);
    });
  }

  chooseAttackTarget(enemies) {
    return enemies.reduce(
      (weakest, e) => (!weakest || e.health < weakest.health ? e : weakest),
      null,
    );
  }
}
