export class LevelSelect extends Phaser.Scene {
  constructor() {
    super("level_select");
  }

  preload() {

  }

  create() {
    this.menu = this.add.group();

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    let level1 = this.add.text(-500, centerY - 150, "Level 1", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "32px",
      color: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 20, y: 10 },
      align: "center",
    });

    let level2 = this.add.text(-500, centerY - 75, "Level 2", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "32px",
      color: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 20, y: 10 },
      align: "center",
    });

    let level3 = this.add.text(-500, centerY, "Level 3", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "32px",
      color: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 20, y: 10 },
      align: "center",
    });

    let backButton = this.add.text(-500, this.scale.height - 50, "Back", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "32px",
      color: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 20, y: 10 },
      align: "center",
    });

    level1.setOrigin(0.5);
    level2.setOrigin(0.5);
    level3.setOrigin(0.5);
    backButton.setOrigin(0.5);

    this.menu.add(level1);
    this.menu.add(level2);
    this.menu.add(level3);
    this.menu.add(backButton);

    this.tweens.add({
      targets: level1,
      x: centerX,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 200,
    });

    this.tweens.add({
      targets: level2,
      x: centerX,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 400,
    });

    this.tweens.add({
      targets: level3,
      x: centerX,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 600,
    });

    this.tweens.add({
      targets: backButton,
      x: centerX,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 800,
    });

    level1.setInteractive({ useHandCursor: true });
    level2.setInteractive({ useHandCursor: true });
    level3.setInteractive({ useHandCursor: true });
    backButton.setInteractive({ useHandCursor: true });

    level1.on("pointerover", () => {
      level1.setStyle({ fill: "#ff0" });
    });

    level1.on("pointerout", () => {
      level1.setStyle({ fill: "#fff" });
    });

    level1.on("pointerdown", () => {
      console.log("Level 1 button clicked");
      // Switch scenes here
      this.scene.start("game", { level : "level1" });
    });

    level2.on("pointerover", () => {
      level2.setStyle({ fill: "#ff0" });
    });

    level2.on("pointerout", () => {
      level2.setStyle({ fill: "#fff" });
    });

    level2.on("pointerdown", () => {
      console.log("Level 2 button clicked");
      // Switch scenes here
      this.scene.start("game", { level : "level2" });
    });

    level3.on("pointerover", () => {
      level3.setStyle({ fill: "#ff0" });
    });

    level3.on("pointerout", () => {
      level3.setStyle({ fill: "#fff" });
    });

    level3.on("pointerdown", () => {
      console.log("Level 3 button clicked");
      // Switch scenes here
      this.scene.start("game", { level : "level3" });
    });

    backButton.on("pointerover", () => {
      backButton.setStyle({ fill: "#ff0" });
    });

    backButton.on("pointerout", () => {
      backButton.setStyle({ fill: "#fff" });
    });

    backButton.on("pointerdown", () => {
      console.log("Back button clicked");
      // Switch scenes here
      this.scene.start("menu");
    });
  }
}