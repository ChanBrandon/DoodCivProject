export default class Tile {
  constructor(scene, q, r, offsetX = 0, offsetY = 0, color = 0x999999) {
    this.scene = scene;
    this.q = q;
    this.r = r;
    this.radius = 30;
    this.color = color;

    const { x, y } = this.axialToPixel(q, r, this.radius);
    this.x = x + offsetX;
    this.y = y + offsetY;

    this.graphics = scene.add.graphics({ x: this.x, y: this.y });
    this.points = this.calculateHexPoints(this.radius);

    this.drawHex(color);
    this.setInteractive();
  }

  axialToPixel(q, r, radius) {
    const width = Math.sqrt(3) * radius;
    const height = 2 * radius;
    const x = width * (q + r / 2);
    const y = (3 / 2) * radius * r;
    return { x, y };
  }

  calculateHexPoints(radius) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = Phaser.Math.DegToRad(60 * i - 30);
      const px = radius * Math.cos(angle);
      const py = radius * Math.sin(angle);
      points.push(new Phaser.Math.Vector2(px, py));
    }
    return points;
  }

  drawHex(color) {
    const g = this.graphics;
    g.clear();
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      g.lineTo(this.points[i].x, this.points[i].y);
    }
    g.closePath();
    g.fillPath();
  }

  setInteractive() {
    this.graphics.setInteractive(
      new Phaser.Geom.Polygon(this.points),
      Phaser.Geom.Polygon.Contains,
    );

    /*
    this.graphics.on("pointerdown", () => {
      this.drawHex(0xff0000); // Highlight on click
      console.log("hex clicked!");
    });
    */

    this.graphics.on("pointerover", () => {
      this.drawHex(0xaaaaaa);
    });

    this.graphics.on("pointerout", () => {
      this.drawHex(this.color);
    });
  }

  setColor(color) {
    this.color = color;
    this.drawHex(color);
  }
}
