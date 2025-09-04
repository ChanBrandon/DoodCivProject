import Tile from "./lib/tile.js";

export class MapCreatorScene extends Phaser.Scene {
  constructor() {
    super("map_creator");
    this.tiles = new Map();
    this.selectedColor = 0x808080; // default neutral
  }

  preload() {
    this.load.image("btnNeutral", "assets/neutral.png");
    this.load.image("btnPlayer1", "assets/player1.png");
    this.load.image("btnAI1", "assets/ai1.png");
    this.load.image("saveBtn", "assets/save.png");
  }

  create() {
    const radius = 30;
    const cols = 10;
    const rows = 10;
    const hexWidth = Math.sqrt(3) * radius;
    const hexHeight = 2 * radius;
    const offsetX = (this.scale.width - (cols * hexWidth + hexWidth / 2)) / 2;
    const offsetY = (this.scale.height - (rows * hexHeight * 0.75 + hexHeight / 4)) / 2;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    this.tiles.clear();

    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        const tile = new Tile(this, q, r, offsetX, offsetY, 0x808080); // default color
        tile.graphics.setInteractive();
        tile.graphics.on("pointerdown", () => {
          if (this.selectedColor === null) {
            tile.graphics.destroy();
            this.tiles.delete(`${tile.q},${tile.r}`);
          } else if (this.selectedColor === "restore") {
          } else {
            tile.setColor(this.selectedColor, true);
          }
        });
        this.tiles.set(`${q},${r}`, tile);
      }
    }

    this.createPalette();
    this.createSaveButton();
    this.createBackButton();

    this.input.on("pointerdown", (pointer) => {
      if (this.selectedColor !== "restore") return;
    
      const local = pointer.positionToCamera(this.cameras.main);
      const tileX = local.x - this.offsetX;
      const tileY = local.y - this.offsetY;
      const { q, r } = this.pixelToAxial(tileX, tileY);
    
      const key = `${q},${r}`;
      if (this.tiles.has(key)) return;
    
      const tile = new Tile(this, q, r, offsetX, offsetY, 0x808080);
      tile.graphics.setInteractive();
      tile.graphics.on("pointerdown", () => {
        if (this.selectedColor === null) {
          tile.graphics.destroy();
          this.tiles.delete(`${tile.q},${tile.r}`);
        } else if (this.selectedColor === "restore") {
          // Already handled
        } else {
          tile.setColor(this.selectedColor, true);
        }
      });
    
      this.tiles.set(key, tile);
    });
  }

  createPalette() {
    const palette = [
      { label: "Neutral", color: 0x808080 },
      { label: "Player", color: 0x3377cc },
      { label: "Enemy", color: 0xd2042d },
      { label: "Remove", color: null },
      { label: "Add", color: "restore" },
    ];
  
    palette.forEach((entry, i) => {
      const btn = this.add
        .text(60, 60 + i * 60, entry.label, {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "18px",
          color: "#ffffff",
          backgroundColor: "#333333",
          padding: { x: 10, y: 6 },
        })
        .setInteractive({ useHandCursor: true })
        .setOrigin(0.5);
  
      btn.on("pointerdown", (pointer, localX, localY, event) => {
        this.selectedColor = entry.color;
        event.stopPropagation();
      });
    });
  }

  createSaveButton() {
    const btn = this.add
      .text(this.scale.width - 80, 60, "Save Map", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#444444",
        padding: { x: 12, y: 6 },
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);
  
    btn.on("pointerdown", () => {
      this.saveMap();
    });
  }

  createBackButton() {
    const btn = this.add
      .text(80, this.scale.height - 40, "← Back", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#444444",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
  
    btn.on("pointerdown", () => {
      this.scene.start("menu"); 
    });
  }

  saveMap() {
    const tilesData = [];
    for (const [key, tile] of this.tiles.entries()) {
      tilesData.push({
        q: tile.q,
        r: tile.r,
        color: `0x${tile.color.toString(16).padStart(6, "0")}`,
      });
    }

    const mapData = {
      num_enemies: 1,
      cols: 10,
      rows: 10,
      tiles: tilesData,
    };

    const blob = new Blob([JSON.stringify(mapData, null, 2)], {
      type: "application/json",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "custom_map.json";
    a.click();
  }

  pixelToAxial(x, y) {
    const radius = 30;
    const q = ((Math.sqrt(3) / 3 * x) - (1 / 3 * y)) / radius;
    const r = (2 / 3 * y) / radius;
  
    return this.hexRound(q, r);
  }
  
  hexRound(q, r) {
    let x = q;
    let z = r;
    let y = -x - z;
  
    let rx = Math.round(x);
    let ry = Math.round(y);
    let rz = Math.round(z);
  
    const x_diff = Math.abs(rx - x);
    const y_diff = Math.abs(ry - y);
    const z_diff = Math.abs(rz - z);
  
    if (x_diff > y_diff && x_diff > z_diff) {
      rx = -ry - rz;
    } else if (y_diff > z_diff) {
      ry = -rx - rz;
    } else {
      rz = -rx - ry;
    }
  
    return { q: rx, r: rz };
  }
}