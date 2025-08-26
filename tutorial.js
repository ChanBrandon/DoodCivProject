export class Tutorial extends Phaser.Scene {
  constructor() {
    super("tutorial");
  }

  preload() {
    // How to ----- images
    this.load.image("htAttack", "assets/attackUnitsTut.png");
    this.load.image("htUnit", "assets/draggingUnitsTut.png");
    this.load.image("htMove", "assets/MovementTut.png");
    this.load.image("htUI", "assets/UITut.png");
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const leftX = this.scale.width * 0.25;   // 25% of screen (text column)
    const rightX = this.scale.width * 0.80;  // 80% of screen (image column)

    this.menu = this.add.group();

    let title = this.add.text(centerX, 85, "How to Play", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "40px",
      color: "#ffffff",
    }).setOrigin(0.5);

    const htAttackImg = this.add.image(rightX, centerY + 110, "htAttack").setScale(0.2);
    const htUnitImg = this.add.image(rightX, centerY - 150, "htUnit").setScale(0.2);
    const htMove = this.add.image(rightX, centerY - 20, "htMove").setScale(0.3);
    const htUIImg = this.add.image(rightX, centerY + 220, "htUI").setScale(0.35);

    // Instruction text
    let instructions = this.add.text(leftX + 100, centerY, 
      "Goal:\n" + 
      "Color the entire map in your own team color\n\n" +
      "Buying Units:\n" +
      "Left Click and drag the units on the left to any tile you own\n" +
      "Each unit has their own health, range, movement, and cost\n\n" +
      "Movement:\n" +
      "Each unit can move a certain amount of spaces\n" +
      "Units can only move once per turn\n" +
      "When a unit moves onto a tile, that unit claims it\n\n" +
      "Combat:\n" +
      "Left Click and drag your unit to an enemy unit to do damage\n" +
      "Each unit can attack once per turn\n\n" +
      "Turns:\n" +
      "You can advance a turn by pressing the SPACE bar\n" +
      "Top right shows current player's turn and the next player's turn\n" + 
      "There are an infinite amount of turns",
      {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "22px",
        color: "#dddddd",
        align: "center",
      }
    ).setOrigin(0.5);

    let backBtn = this.add.text(-500, this.scale.height - 50, "Back", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "32px",
      color: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 20, y: 10 },
      align: "center",
    }).setOrigin(0.5);

    this.menu.add(backBtn);

    this.tweens.add({
      targets: backBtn,
      x: centerX,
      ease: "Sine.easeOut",
      duration: 600,
      delay: 100,
    });

    backBtn.setInteractive({ useHandCursor: true });

    backBtn.on("pointerover", () => backBtn.setStyle({ fill: "#ff0" }));
    backBtn.on("pointerout", () => backBtn.setStyle({ fill: "#fff" }));

    backBtn.on("pointerdown", () => {
      console.log("Tutorial -> To Menu");
      this.scene.start("menu");
    });
  }
}
