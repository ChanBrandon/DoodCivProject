export class Menu extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    console.log("does this create?");
    this.menu = this.add.group();

    let title = this.add.text(
      -500,
      this.scale.height / 4,
      "Placeholder game title",
      {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "48px",
        color: "#ffffff",
      },
    );

    let subTitle = this.add.text(
      -500,
      this.scale.height / 3.35,
      "A game by the Doods",
      {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "20px",
        color: "#ffffff",
      },
    );

    title.setOrigin(0.5);
    subTitle.setOrigin(0.5);
    this.menu.add(title);
    this.menu.add(subTitle);

    this.tweens.add({
      targets: title,
      x: this.scale.width / 4,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 200,
    });

    this.tweens.add({
      targets: subTitle,
      x: this.scale.width / 5.5,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 600,
    });
  }
}
