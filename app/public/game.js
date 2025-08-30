import { Menu } from "./menu.js";
import { GameScene } from "./gameScene.js";
import { TutorialScene } from "./TutorialScene.js";
import { LevelSelect } from "./level_select.js";
import { MapCreatorScene } from "./MapCreatorScene.js";
import { HowTo } from "./howTo.js";

console.log("hello");

const game = new Phaser.Game({
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game",
  scene: [Menu, GameScene, LevelSelect, MapCreatorScene, HowTo, TutorialScene],
  backgroundColor: 0x191970,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
