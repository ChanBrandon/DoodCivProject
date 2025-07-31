export class Menu extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  preload() {
    this.load.audio("menuMusic", "assets/test.mp3");
  }

  create() {
    console.log("does this create?");
    this.menu = this.add.group();

    let music = this.sound.add("menuMusic", {
      loop: true,
      volume: 0.5,
    });

    music.play();

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    let title = this.add.text(-500, centerY - 200, "Placeholder game title", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "48px",
      color: "#ffffff",
    });

    let subTitle = this.add.text(-500, centerY - 150, "A game by the Doods", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "20px",
      color: "#ffffff",
    });

    title.setOrigin(0.5);
    subTitle.setOrigin(0.5);
    this.menu.add(title);
    this.menu.add(subTitle);

    this.tweens.add({
      targets: title,
      x: centerX - 400,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 200,
    });

    this.tweens.add({
      targets: subTitle,
      x: centerX - 400,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 600,
    });
  }
}
