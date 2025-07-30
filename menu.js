export class Menu extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    console.log("does this create?");
    this.menu = this.add.group();

    let title = this.add.text(
      this.scale.width / 2,
      this.scale.height / 3,
      "Placeholder game title",
      {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "48px",
        color: "#ffffff",
      },
    );

    this.scale.on("resize", (gameSize) => {
      title.setPosition(gameSize.width / 2, gameSize.height / 3);
    });

    title.setOrigin(0.5);

    this.menu.add(title);
  }
}
