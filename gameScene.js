import Tile from "./lib/tile.js";
import UnitTray from "./lib/unitTray.js";
import Unit from "./lib/unit.js";
import EnemyAI from "./lib/enemyAI.js";
import UnitProgression from "./UnitProgression.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");

    this.Unit = Unit;

    this.players = ["Player 1"];
    this.turnIndex = 0;
    this.round = 1;

    this.AIs = [];

    this.turnText = null;
    this.endTurnBtn = null;
    this.goldText = null;

    this.tiles = new Map();
    this.units = [];

    this.highlightedTiles = [];

    // combat
    this.selectedUnit = null;
    this.targetUnit = null;
  }

  init(data) {
    this.level = data.level;
  }

  preload() {
    this.load.json("level1", "assets/levels/level1.json");
    this.load.json("level2", "assets/levels/level2.json");
    this.load.json("level3", "assets/levels/level3.json");

    this.load.image("scout", "assets/scout.png");
    this.load.image("warrior", "assets/warrior.png");
    this.load.image("knight", "assets/knight.png");
    this.load.image("lancer", "assets/lancer.png");
    this.load.image("slinger", "assets/slinger.png");
    this.load.image("archer", "assets/archer.png");
    this.load.image("swordsman", "assets/swordsman.png");
    this.load.image("horseman", "assets/horseman.png");
    this.load.image("chariot", "assets/chariot.png");
    this.load.image("musketeer", "assets/musketeer.png");
  }

  async create() {
    const levelData = this.cache.json.get(this.level);

    // Reset players table
    await fetch("http://localhost:3000/clear_table?name=players");

    for (let i = 1; i < levelData.num_enemies + 1; i++) {
      const aiName = "AI " + i;
      this.players.push(aiName);

      this.AIs.push(new EnemyAI(this, aiName));
    }

    for (let player_name of this.players) {
      await fetch("http://localhost:3000/add_player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: player_name }),
      });
    }

    // ===== UNIT PROGRESSION HUD (LEFT PANEL) =====
    // Tiers are easy to tweak; icons use your existing PNGs in /assets
    const units = [
      // Tier 1
      { id: "warrior", name: "Warrior", tier: 1, iconKey: "warrior" },
      { id: "slinger", name: "Slinger", tier: 1, iconKey: "slinger" },
      { id: "scout", name: "Scout", tier: 1, iconKey: "scout" },

      // Tier 2
      { id: "archer", name: "Archer", tier: 2, iconKey: "archer" },
      { id: "swordsman", name: "Swordsman", tier: 2, iconKey: "swordsman" },
      { id: "horseman", name: "Horseman", tier: 2, iconKey: "horseman" },

      // Tier 3
      { id: "knight", name: "Knight", tier: 3, iconKey: "knight" },
      { id: "chariot", name: "Chariot", tier: 3, iconKey: "chariot" },
      { id: "lancer", name: "Lancer", tier: 3, iconKey: "lancer" },

      // Tier 4
      { id: "musketeer", name: "Musketeer", tier: 4, iconKey: "musketeer" },
    ];

    this.unitUI = new UnitProgression(this, {
      units,
      turnsPerTier: 5, // unlock next tier every 5 rounds
      onTierUnlock: (tier) => {
        // optional: toast/SFX/etc.
        console.log(`Unlocked Tier ${tier}`);
      },
    });

    // If you don’t have a global TurnManager emitting "turn:changed",
    // call this when your round changes:
    // this.unitUI.applyRound(this.round);

    // Keep panel sized on resize (UnitProgression also listens, but safe)
    this.scale.on("resize", (size) => {
      // nothing else required; UnitProgression re-lays out on resize
    });

    const radius = 30;
    const hexWidth = Math.sqrt(3) * radius;
    const hexHeight = 2 * radius;

    const cols = levelData.cols;
    const rows = levelData.rows;

    const gridPixelWidth = hexWidth * cols + hexWidth / 2;
    const gridPixelHeight = hexHeight * 0.75 * rows + hexHeight / 4;

    const offsetX = (this.scale.width - gridPixelWidth) / 2;
    const offsetY = (this.scale.height - gridPixelHeight) / 2;

    const playerColors = {
      "Player 1": 0x3377cc,
      "AI 1": 0xd2042d,
      "AI 2": 0xcc3333,
    };

    for (const tileData of levelData.tiles) {
      const { q, r, color } = tileData;
      const tileColor = parseInt(color);
      const tile = new Tile(this, q, r, offsetX, offsetY, tileColor);

      for (const [playerName, playerColor] of Object.entries(playerColors)) {
        if (tileColor === playerColor) {
          tile.setOwner(playerName);
          break;
        }
      }

      this.tiles.set(`${q},${r}`, tile);

      const dz = this.add
        .zone(tile.x, tile.y, hexWidth * 0.9, hexHeight * 0.9)
        .setRectangleDropZone(hexWidth * 0.9, hexHeight * 0.9);
      dz.setData("tileObj", tile);
    }

    this.input.setTopOnly(true);

    this.createUnitTray();

    // HUD
    this.createTurnHud();
    this.renderTurnHud();

    await this.loadUnitDataFromDB();

    this.input.keyboard.on("keydown-SPACE", () => this.advanceTurn());

    this.scale.on("resize", (size) => {
      const x = size.width - 260;
      if (this.turnText) this.turnText.setPosition(x, 20);
      if (this.endTurnBtn) this.endTurnBtn.setPosition(x, 92);
      if (this.goldText) this.goldText.setPosition(x, 160);
    });

    this.input.on("gameobjectdown", async (_pointer, obj) => {
      if (obj.unitId) {
        const unit = this.units.find((unit) => unit.id === obj.unitId);
        if (unit) {
          this.onUnitClick(unit);
        }
      }
    });

    this.selectedUnit = null;

    this.units.forEach((unit) => {
      unit.sprite.setInteractive();
      unit.sprite.on("pointerdown", () => {
        if (!this.selectedUnit) {
          if (unit.owner === "Player 1") {
            this.selectedUnit = unit;
          }
          return;
        }
        if (this.selectedUnit && unit.owner !== this.selectedUnit.owner) {
          this.combat(this.selectedUnit.id, unit.id);
          this.selectedUnit = null;
        }
      });
    });
  }

  createUnitTray() {
    new UnitTray(this, 80, 80, "knight", "Player 1", Unit);
  }

  shutdown() {
    this.unitUI?.destroy();
  }

  clearHighlightedTiles() {
    this.highlightedTiles.forEach((tile) => tile.setColor(tile.baseColor));
    this.highlightedTiles = [];
  }

  currentPlayer() {
    return this.players[this.turnIndex];
  }

  nextPlayer() {
    return this.players[(this.turnIndex + 1) % this.players.length];
  }

  async advanceTurn() {
    const current = this.currentPlayer();

    this.units.forEach((unit) => {
      if (unit.owner === current) {
        unit.incrementTurn();
      }
    });

    const ownedTileCount = Array.from(this.tiles.values()).filter(
      (tile) => tile.owner === current,
    ).length;
    const goldGained = ownedTileCount * 5;
    this.playerGold += goldGained;
    await fetch("http://localhost:3000/set_gold", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: current, gold: this.playerGold }),
    });

    if (current.startsWith("AI")) {
      const ai = this.AIs.find((ai) => ai.name === current);
      if (ai) {
        ai.newTurn();
        ai.takeTurn();
      }
    }

    this.turnIndex = (this.turnIndex + 1) % this.players.length;
    if (this.turnIndex === 0) this.round += 1;

    this.renderTurnHud();
  }

  createTurnHud() {
    const x = this.scale.width - 260;

    this.turnText = this.add.text(x, 20, "", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: "#262c44",
      padding: { x: 12, y: 8 },
      align: "left",
    });

    this.endTurnBtn = this.add
      .text(x, 92, "End Turn (Space)", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#2370aa",
        padding: { x: 12, y: 8 },
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.advanceTurn());

    this.goldText = this.add.text(x, 160, "", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "16px",
      color: "#ffd700",
      backgroundColor: "#444",
      padding: { x: 12, y: 8 },
    });
  }

  async renderTurnHud() {
    const current = this.currentPlayer();
    const next = this.nextPlayer();
    await fetch(`/get_gold?player=${encodeURIComponent("Player 1")}`)
      .then((res) => res.json())
      .then((data) => {
        this.playerGold = data.gold;
      });

    this.turnText.setText(
      `Round: ${this.round}\nCurrent: ${current}\nNext: ${next}`,
    );
    this.goldText.setText(`Gold: ${this.playerGold}`);
  }

  async loadUnitDataFromDB() {
    try {
      const res = await fetch(`/get_all_units`);
      const unitsData = await res.json();

      /* 
      for (let unitData of unitsData) {
        const unit = new this.Unit(
          this,
          unitData.q_pos,
          unitData.r_pos,
          unitData.unit_type,
          unitData.owned_by,
        );
        unit.id = unitData.id;
        unit.sprite.unitId = unitData.id;
        const tile = this.tiles.get(`${unit.q_pos},${unit.r_pos}`);
        if (tile) {
          unit.moveToTile(tile);
          tile.unit = unit;
          unit.boundTile = tile;
        }
        this.units.push(unit);
      }
      */
    } catch (error) {
      console.error("Error loading units from Database:", error);
    }
  }

  async checkUnitRange(attackerId, victimId) {
    try {
      const res = await fetch(
        `/detect_units?attackId=${attackerId}&enemyId=${victimId}`,
      );
      return await res.json();
    } catch (error) {
      console.error("Error checking range:", error);
      return false;
    }
  }

  async onUnitClick(unit) {
    if (!this.selectedUnit) {
      if (unit.owner !== this.currentPlayer()) return;
      this.selectedUnit = unit;
    } else {
      if (unit.owner === this.currentPlayer()) return;
      this.targetUnit = unit;

      const inRange = await this.checkUnitRange(
        this.selectedUnit.id,
        this.targetUnit.id,
      );
      if (inRange) {
        await this.combat(this.selectedUnit.id, this.targetUnit.id);
      }
      this.selectedUnit = null;
      this.targetUnit = null;
    }
  }

  async combat(attackerId, victimId) {
    try {
      let res = await fetch(
        `/combat?attackerId=${attackerId}&victimId=${victimId}`,
      );
      let data = await res.json();

      if (data.error) {
        console.error("Error:", data.error);
        return;
      }

      if (data.victimUpdated && data.victimUpdated.current_health > 0) {
        let victimUnit = this.units.find((unit) => unit.id === victimId);
        if (victimUnit) {
          console.log(
            `Victim ${victimId} now has ${data.victimUpdated.current_health} HP`,
          );
        }
      }

      if (data.victimDefeated) {
        let victimIndex = this.units.findIndex((unit) => unit.id === victimId);
        if (victimIndex !== -1) {
          this.units[victimIndex].sprite.destroy();
          this.units.splice(victimIndex, 1);
        }
      }
    } catch (error) {
      console.error("Error, combat request failed:", error);
    }
  }
}
