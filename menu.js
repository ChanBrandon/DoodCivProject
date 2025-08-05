export class Menu extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  preload() {
    this.load.audio("menuMusic", "assets/test.mp3");
    this.load.image("soundOn", "assets/sound-on.png");
    this.load.image("soundOff", "assets/sound-off.png");
  }

  create() {
    this.menu = this.add.group();

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    let music = this.sound.add("menuMusic", {
      loop: true,
      volume: 0.5,
      mute: true, // start muted
    });
    
    const iconSize = 48;
    const soundButton = this.add
      .image(this.scale.width - iconSize - 20, iconSize + 20, "soundOff")
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(10)
      .setDisplaySize(iconSize, iconSize)
      .setOrigin(0.5);
    
    let isMuted = true;
    let hasStartedMusic = false;
    
    soundButton.on("pointerdown", () => {
      isMuted = !isMuted;
      music.setMute(isMuted);
      soundButton.setTexture(isMuted ? "soundOff" : "soundOn");
    
      if (!hasStartedMusic && !isMuted) {
        music.play();
        hasStartedMusic = true;
      }
    
      soundButton.setDisplaySize(iconSize, iconSize);
    });
    
    this.menu.add(soundButton);

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

    let playButton = this.add.text(-500, centerY + 50, "Play", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "32px",
      color: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 20, y: 10 },
      align: "center"
    });

    let tutorialButton = this.add.text(-500, centerY + 125, "Tutorial", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "32px",
      color: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 20, y: 10 },
      align: "center"
    });
    
    let createMapButton = this.add.text(-500, centerY + 200, "Map Creator", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "32px",
      color: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 20, y: 10 },
      align: "center"
    });
  
    title.setOrigin(0.5);
    subTitle.setOrigin(0.5);
    playButton.setOrigin(0.5);
    tutorialButton.setOrigin(0.5);
    createMapButton.setOrigin(0.5);

    this.menu.add(title);
    this.menu.add(subTitle);
    this.menu.add(playButton);
    this.menu.add(tutorialButton);
    this.menu.add(createMapButton);
  
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
      delay: 400,
    });

    this.tweens.add({
      targets: playButton,
      x: centerX - 400,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 600,
    });

    this.tweens.add({
      targets: tutorialButton,
      x: centerX - 400,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 600,
    });

    this.tweens.add({
      targets: createMapButton,
      x: centerX - 400,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 600,
    });

    playButton.setInteractive({ useHandCursor: true });
    tutorialButton.setInteractive({ useHandCursor: true });
    createMapButton.setInteractive({ useHandCursor: true });
  
    playButton.on("pointerover", () => {
      playButton.setStyle({ fill: "#ff0" });
    });

    playButton.on("pointerout", () => {
      playButton.setStyle({ fill: "#fff" });
    });

    playButton.on("pointerdown", () => {
      console.log("Play button clicked");
      // Switch scenes here
    });

    tutorialButton.on("pointerover", () => {
      tutorialButton.setStyle({ fill: "#ff0" });
    });

    tutorialButton.on("pointerout", () => {
      tutorialButton.setStyle({ fill: "#fff" });
    });

    tutorialButton.on("pointerdown", () => {
      console.log("Tutorial button clicked");
      // Switch scenes here
    });

    createMapButton.on("pointerover", () => {
      createMapButton.setStyle({ fill: "#ff0" });
    });

    createMapButton.on("pointerout", () => {
      createMapButton.setStyle({ fill: "#fff" });
    });

    createMapButton.on("pointerdown", () => {
      console.log("Create Map button clicked");
      // Switch scenes here
    });
  }
}