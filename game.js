import { Menu } from "./menu.js";
import { GameScene } from "./gameScene.js";

console.log("hello");

const game = new Phaser.Game({
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game",
  scene: [Menu, GameScene],
  backgroundColor: 0x191970,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
