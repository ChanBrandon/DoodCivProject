// UnitProgression.js
// Lightweight unit list + 5-round tier progression HUD for Phaser 3.
//

import UnitTray from "./lib/unitTray.js";
import Unit from "./lib/unit.js";

export default class unitProgression {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} opts
   * @param {Array<{id:string,name:string,tier:number,iconKey?:string}>} opts.units
   * @param {number} [opts.turnsPerTier=5]
   * @param {number} [opts.panelWidth=260]
   * @param {(tier:number)=>void} [opts.onTierUnlock] // optional callback
   */
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.units = (opts.units || [])
      .slice()
      .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
    this.turnsPerTier = opts.turnsPerTier ?? 5;
    this.panelWidth = opts.panelWidth ?? 260;
    this.onTierUnlock = opts.onTierUnlock;

    this.ownerIndex = opts.ownerIndex ?? 0; // pass in who owns this tray list
    this.UnitClass = opts.UnitClass ?? null; // pass in the unit class to spawn

    this.unlockedTier = 1;
    this.bg = null;
    this.title = null;
    this.list = null;
    this.rows = []; // {unit, container, tray, label, lockOverlay}

    this._onResize = this._onResize.bind(this);
    this._onTurnChanged = this._onTurnChanged.bind(this);

    this._buildUI();
    this.applyRound(this._currentRound());

    if (this.scene.game?.events) {
      this.scene.game.events.on("turn:changed", this._onTurnChanged);
    }
    this.scene.scale.on("resize", this._onResize);
  }

  // --- public API ------------------------------------------------------------

  updateTrayAffordability(playerGold) {
    for (const row of this.rows) {
      // skip locked tiers
      if (row.unit.tier > this.unlockedTier) continue;

      if (row.tray.cost != null) {
        const canAfford = playerGold >= row.tray.cost;
        row.tray.setAffordable(canAfford);
      }
    }
  }
  /** Call when your round changes (if you don’t emit turn:changed). */
  applyRound(round) {
    const newTier =
      Math.floor((Math.max(1, round) - 1) / this.turnsPerTier) + 1;
    if (newTier !== this.unlockedTier) {
      this.unlockedTier = newTier;
      if (this.onTierUnlock) this.onTierUnlock(this.unlockedTier);
    }
    this._renderLocks();
  }

  /** Replace unit list at runtime (optional). */
  setUnits(units) {
    this.units = (units || [])
      .slice()
      .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
    this._rebuildRows();
    this._renderLocks();
  }

  /** Clean up listeners & objects (call on scene shutdown). */
  destroy() {
    this.scene.scale.off("resize", this._onResize);
    this.scene.game?.events?.off("turn:changed", this._onTurnChanged);
    [
      this.bg,
      this.title,
      this.list,
      ...this.rows.map((r) => r.container),
    ].forEach((o) => o?.destroy());
    this.rows = [];
  }

  // --- internals -------------------------------------------------------------

  _currentRound() {
    if (this.scene.game?.turnManager?.round)
      return this.scene.game.turnManager.round;
    if (typeof this.scene.round === "number") return this.scene.round;
  }

    this.bg = this.scene.add
      .rectangle(0, 0, this.panelWidth, height, 0x111522, 0.85)
      .setOrigin(0, 0)
      .setDepth(1000)
      .setScrollFactor(0);

    this.title = this.scene.add
      .text(16, 10, "Units", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "20px",
        color: "#ffffff",
      })
      .setDepth(1001)
      .setScrollFactor(0);

    this.list = this.scene.add
      .container(0, 40)
      .setDepth(1001)
      .setScrollFactor(0);

    this._rebuildRows();
    this._layout(width, height);
  }

  _rebuildRows() {
    this.list.removeAll(true);
    this.rows = [];
      );

      const label = this.scene.add.text(
        left + 48,
        12,
        `${u.name}  (T${u.tier})`,
        {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "16px",
          color: "#ffffff",
        },
      );

      const lockOverlay = this.scene.add
        .rectangle(0, 0, this.panelWidth, rowH, 0x000000, 0.45)
        .setOrigin(0, 0)
        .setVisible(false);

      const underline = this.scene.add
        .rectangle(0, rowH - 1, this.panelWidth, 1, 0x2a2f41)
        .setOrigin(0, 1);

      row.add([tray.sprite, label, lockOverlay, underline]);
      row.setPosition(0, y);
      this.list.add(row);

      this.rows.push({ unit: u, container: row, tray, label, lockOverlay });
      y += rowH;
    }
  }

  _layout(w, h) {
    this.bg?.setSize(this.panelWidth, h);
    this.bg?.setPosition(0, 0);
    this.list?.setPosition(0, 40);
  }

  _renderLocks() {
    for (const row of this.rows) {
      const locked = row.unit.tier > this.unlockedTier;
      row.lockOverlay.setVisible(locked);
      row.tray.sprite.disableInteractive(); // default
      if (!locked) {
        row.tray.sprite.setInteractive({ useHandCursor: true });
      }
      row.tray.sprite.setAlpha(locked ? 0.35 : 1);
      row.label.setAlpha(locked ? 0.6 : 1);
    }
  }
}        "Player 1",
        Unit,
        u.id,
        36,
        30, // offset so it sits in row
        u.iconKey, // texture

      const tray = new UnitTray(
        this.scene,
    const pad = 12,
      rowH = 60,
      //
      left = 16;
    let y = pad;


    for (const u of this.units) {
      const row = this.scene.add.container(0, y);

  _buildUI() {
    const { width, height } = this.scene.scale;
    return 1;
  _onResize(size) {
    this._layout(size.width, size.height);
  }


  _onTurnChanged(payload) {
    const round = payload?.round ?? this._currentRound();
    this.applyRound(round);
