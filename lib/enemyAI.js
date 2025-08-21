import Unit from "./unit.js";

export default class EnemyAI {
  constructor(scene, name = "Enemy AI") {
    this.scene = scene;
    this.name = name;
    this.units = [];
    this.gold = 50;
  }

  addUnit(unit) {
    this.units.push(unit);
    unit.owner = this.name;
  }

  takeTurn() {
    console.log(`${this.name} is taking its turn...`);

    // Spend gold before moving
    this.tryToBuyUnits();

    this.units.forEach((unit) => {
      if (unit.moved || unit.health <= 0) return;

      // 1. Attack enemy in range
      const enemiesInRange = this.getEnemyUnitsInRange(unit);
      console.log(enemiesInRange);
      if (enemiesInRange.length > 0) {
        console.log("AI is attaching unit!");
        unit.attack(enemiesInRange[0]);
        unit.moved = true;
        return;
      }

      // 2. Expand to nearest neutral tile
      const targetTile = this.findNearestNeutralTile(unit);
      if (targetTile) {
        this.moveAndClaim(unit, targetTile);
        return;
      }

      // 3. Otherwise wander randomly
      const reachable = unit.getReachableTiles(this.scene.tiles);
      if (reachable.length > 0) {
        const randTile =
          reachable[Math.floor(Math.random() * reachable.length)];
        if (!randTile.unit) {
          this.moveAndClaim(unit, randTile);
        }
      }
    });
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
    const ownedTiles = Array.from(this.scene.tiles.values()).filter(
      (t) => t.owner === this.name && !t.unit,
    );

    if (this.gold >= 20 && ownedTiles.length > 0) {
      const spawnTile =
        ownedTiles[Math.floor(Math.random() * ownedTiles.length)];
      const newUnit = new Unit(
        this.scene,
        spawnTile.q,
        spawnTile.r,
        "knight",
        this.name,
      );
      spawnTile.unit = newUnit;
      newUnit.boundTile = spawnTile;
      this.addUnit(newUnit);
      this.scene.units.push(newUnit);
      newUnit.moveToTile(spawnTile);
      this.gold -= 20;
      console.log(
        `${this.name} bought a warrior on tile (${spawnTile.q}, ${spawnTile.r})`,
      );
    }
  }

  moveAndClaim(unit, tile) {
    unit.moveToTile(tile);
    tile.unit = unit;
    tile.setOwner(this.name);
    unit.boundTile = tile;
    unit.moved = true;
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
    const tileMap = new Map();
    this.scene.tiles.forEach((tile, key) => {
      tileMap.set(key, tile);
    });

    const inRangeTiles = unit.getAttackableTiles(tileMap);

    console.log(
      "Attackable Tiles:",
      inRangeTiles.map((t) => `(${t.q},${t.r})`),
    );

    return this.scene.units.filter(
      (other) =>
        other.owner !== this.name &&
        other.health > 0 &&
        other.boundTile &&
        inRangeTiles.includes(other.boundTile),
    );
  }
}
