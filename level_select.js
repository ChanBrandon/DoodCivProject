export class LevelSelect extends Phaser.Scene {
  constructor() {
    super("level_select");
  }

  preload() {
  }

  create() {
    if (!document.getElementById("mapFileInput")) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.style.display = "none";
      input.id = "mapFileInput";
      document.body.appendChild(input);
    }
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

    let loadMapBtn = this.add.text(-500, centerY + 75, "Load a Map", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "32px",
      color: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 20, y: 10 },
      align: "center",
    });
    
    let viewMapsBtn = this.add.text(-500, centerY + 150, "View Uploaded Maps", {
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
    loadMapBtn.setOrigin(0.5);
    viewMapsBtn.setOrigin(0.5);
    backButton.setOrigin(0.5);

    this.menu.add(level1);
    this.menu.add(level2);
    this.menu.add(level3);
    this.menu.add(backButton);
    this.menu.add(loadMapBtn);
    this.menu.add(viewMapsBtn);

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

    this.tweens.add({
      targets: loadMapBtn,
      x: centerX,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 800,
    });
    
    this.tweens.add({
      targets: viewMapsBtn,
      x: centerX,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 1000,
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

    loadMapBtn.setInteractive({ useHandCursor: true });
    loadMapBtn.on("pointerdown", () => {
      document.getElementById("mapFileInput").click();
    });
    
    document.getElementById("mapFileInput").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
    
      const reader = new FileReader();
      reader.onload = (e) => {
        const mapJson = JSON.parse(e.target.result);
    
        const levelName = prompt("Enter a name for this level:");
        if (!levelName) return;
    
        // Save to localStorage
        const existingMaps = JSON.parse(localStorage.getItem("customMaps") || "{}");
        existingMaps[levelName] = mapJson;
        localStorage.setItem("customMaps", JSON.stringify(existingMaps));
    
        alert(`Map "${levelName}" loaded! You can now view it from 'View Uploaded Maps'.`);
      };
      reader.readAsText(file);
    
      // Reset input value to allow re-upload of same file
      event.target.value = "";
    });

    viewMapsBtn.setInteractive({ useHandCursor: true });
    viewMapsBtn.on("pointerdown", () => {
      if (this.mapButtons) {
        this.mapButtons.forEach(btn => btn.destroy());
      }

      this.mapButtons = [];
      const maps = JSON.parse(localStorage.getItem("customMaps") || "{}");
    
      if (Object.keys(maps).length === 0) {
        alert("No uploaded maps found.");
        return;
      }
    
      const centerX = this.cameras.main.centerX;
      const centerY = this.cameras.main.centerY;
    
      Object.keys(maps).forEach((mapName, i) => {
        const btn = this.add.text(centerX - 100, centerY + 200 + i * 50, mapName, {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "20px",
          color: "#ffffff",
          backgroundColor: "#444",
          padding: { x: 10, y: 6 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
    
        btn.on("pointerdown", () => {
          this.cache.json.add(mapName, maps[mapName]);
          this.scene.start("game", { level: mapName });
        });
    
        const delBtn = this.add.text(centerX + 100, centerY + 200 + i * 50, "🗑️", {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "20px",
          color: "#ff5555",
          backgroundColor: "#222",
          padding: { x: 8, y: 6 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
    
        delBtn.on("pointerdown", () => {
          const confirmDelete = confirm(`Delete map "${mapName}"?`);
          if (!confirmDelete) return;
    
          // Remove from localStorage
          const updatedMaps = JSON.parse(localStorage.getItem("customMaps") || "{}");
          delete updatedMaps[mapName];
          localStorage.setItem("customMaps", JSON.stringify(updatedMaps));
    
          this.mapButtons.forEach(btn => btn.destroy());
          this.mapButtons = [];
          viewMapsBtn.emit("pointerdown");
        });
    
        this.mapButtons.push(btn, delBtn);
      });
    });
  }
}