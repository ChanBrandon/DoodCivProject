export default class Unit {
  constructor(scene, q, r, textureKey, ownerIndex, movementRange = 3) {
    this.scene = scene;
    this.q = q;
    this.r = r;
    this.ownerIndex = ownerIndex;
    this.movementRange = movementRange;

    const { x, y } = this.axialToPixel(q, r, 30);

    this.sprite = scene.add
      .image(x, y, textureKey)
      .setScale(0.5)
      .setInteractive({ useHandCursor: true });
    this.sprite.setDepth(10);
    this.sprite.setData("unit", this);

    scene.input.setDraggable(this.sprite);

    this.startX = x;
    this.startY = y;

    this.sprite.unitObj = this;
  }

  axialToPixel(q, r, radius) {
    const width = Math.sqrt(3) * radius;
    const height = 2 * radius;
    const x = width * (q + r / 2);
    const y = (3 / 2) * radius * r;
    return { x, y };
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

    while (frontier.length > 0) {
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

    const { x, y } = { x: tile.x, y: tile.y };
    this.sprite.x = x;
    this.sprite.y = y;

    this.startX = x;
    this.startY = y;
  }

  resetPosition() {
    this.sprite.x = this.startX;
    this.sprite.y = this.startY;
  }
}
