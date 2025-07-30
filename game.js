import { Menu } from "./menu.js";

console.log("hello");

const game = new Phaser.Game({
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game",
  scene: [Menu],
  backgroundColor: 0x191970,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
