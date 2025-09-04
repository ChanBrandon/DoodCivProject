const pg = require("pg");
const express = require("express");
const app = express();
const port = 3000;
const hostname = "localhost";
const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const { parse } = require("csv-parse/sync");
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});
const SelectEntity = require('./selectEntity');
const selectEntity = new SelectEntity(pool);
const Combat = require('./public/combat');
const combat = new Combat(pool);

app.use(express.static("public"));
app.use(express.json());

// Returns all units from units_state
app.get("/get_all_units", async (req, res) => {
  try {
    const result = await selectEntity.getAllUnits(); 
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching all units.");
  }
});


// get the unit from the units_data table
app.get("/get_unit", async (req, res) => {
  try {
    const unitName = req.query.unitName;
    const unit = await selectEntity.getNewUnit(unitName);
    res.json(unit);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting unit.");
  }
});

// get the unit from the units_state table
app.get("/get_unit_state", async (req, res) => {
  // Ex: "/get_unit_state?id=2"
  try {
    const id = req.query.id;
    const unit = await selectEntity.getUnitState(id);
    res.json(unit);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting unit state.");
  }
});

// for when a new unit is bought 
app.get("/initiate_unit", async (req, res) => {
  try {
    const unitName = req.query.unitName;
    const q_pos = parseInt(req.query.q_pos);
    const r_pos = parseInt(req.query.r_pos);
    const player = decodeURIComponent(req.query.player);
    const response = await fetch(`http://localhost:3000/get_unit?unitName=${unitName}`);
    const unit = await response.json();
    await selectEntity.initiateUnit(unit, q_pos, r_pos, player);
    res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error initiating unit.");
  }
});

// basically, gets the chosen unit's range, look around for enemy units
// send true if in range and can attack -> send to "/get_combat_units"
app.get("/detect_units", async (req, res) => {
  try {
    // requires positions for both player and enemy units

    const attackId = req.query.attackId;
    const enemyId = req.query.enemyId;
    
    const attackUnitType = await selectEntity.getUnitType(attackId);
    const attackPos = await selectEntity.getUnitPosition(attackId);
    const range = await selectEntity.getUnitRange(attackUnitType);
    const enemyPos = await selectEntity.getUnitPosition(enemyId);
    
    // bool value
    const inRange = await combat.check_range(attackPos.q_pos, attackPos.r_pos, range, enemyPos.q_pos, enemyPos.r_pos); // change this
   
    res.json(inRange);
  } catch (error) {
    res.status(500).send("Error getting unit.");
  }

});

// called when units are attacking one another
// this function should get both the attacker and victim and update both units in the table 
// only called when the above get function, "get_unit_id" is true
app.get("/combat", async (req, res) => {
  try {
    const attackerId = parseInt(req.query.attackerId);
    const victimId = parseInt(req.query.victimId);

    const result = await combat.attack(attackerId, victimId);
    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error in combat.");
  }

});

// adds player to players table
app.post("/add_player", async (req, res) => {
  const { player } = req.body;
  await pool.query("INSERT INTO players (name) VALUES ($1)", [player]);
  res.send();
});

// clear given table
app.get("/clear_table", async (req, res) => {
  try {
    const name = req.query.name;
    await pool.query(`TRUNCATE TABLE ${name} RESTART IDENTITY`);
    return res.send();
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Error clearing table.`);
  }
});

app.get("/get_gold", async (req, res) => {
  try {
    const player = req.query.player;
    const result = await pool.query("SELECT gold FROM players WHERE name = $1", [player]);
    return res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error getting gold.");
  }
});

app.put("/set_gold", async (req, res) => {
  try {
    const { name, gold } = req.body;
    await pool.query("UPDATE players SET gold = $1 WHERE name = $2", [gold, name]);
    res.send();
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error setting gold.");
  }
});

app.post("/export_table", async (req, res) => {
  const { table, level } = req.body;

  try {
    // Query DB for all rows in the table
    const result = await pool.query(`SELECT * FROM ${table}`);

    // Create folder if it doesn't exist
    const dir = path.join(__dirname, "public", "saves", level);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // CSV file path
    const filePath = path.join(dir, `${table}.csv`);

    // Convert DB rows to CSV
    const parser = new Parser();
    const csv = parser.parse(result.rows);

    fs.writeFileSync(filePath, csv);

    // Return URL for browser download
    res.json({ success: true, url: `/saves/${level}/${table}.csv` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save table" });
  }
});

app.post("/import_table", async (req, res) => {
  const { table, level } = req.body;

  try {
    const filePath = path.join(__dirname, "public", "saves", level, `${table}.csv`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "CSV file not found" });
    }

    const csvContent = fs.readFileSync(filePath, "utf8");
    const rows = parse(csvContent, { columns: true, skip_empty_lines: true });

    // Clear existing table before importing
    await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY`);

    // Insert rows
    for (const row of rows) {
      const columns = Object.keys(row).join(",");
      const values = Object.values(row)
        .map(v => `'${v}'`) // simple quoting; sanitize for production!
        .join(",");
      await pool.query(`INSERT INTO ${table} (${columns}) VALUES (${values})`);
    }

    res.json({ success: true, message: `Imported ${rows.length} rows into ${table}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to import CSV into DB" });
  }
});

app.post("/save_turn", (req, res) => {
  const { level, turn, round } = req.body;
  const dir = path.join(__dirname, "public", "saves", level);
  const filePath = path.join(dir, "turn.json");

  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ turn, round }));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save turn state" });
  }
});

app.get("/load_turn", (req, res) => {
  const level = req.query.level;
  const filePath = path.join(__dirname, "public", "saves", level, "turn.json");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Turn state file not found" });
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const { turn, round } = JSON.parse(content);
    res.json({ success: true, turn, round });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load turn state" });
  }
});

app.post("/save_tiles", (req, res) => {
  const { level, tiles } = req.body;
  const dir = path.join(__dirname, "public", "saves", level);
  const filePath = path.join(dir, "tiles.json");

  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ tiles }));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save tiles" });
  }
});

app.get("/load_tiles", (req, res) => {
  const level = req.query.level;
  const filePath = path.join(__dirname, "public", "saves", level, "tiles.json");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Tiles file not found" });
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const { tiles } = JSON.parse(content);
    res.json({ success: true, tiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load tiles" });
  }
});

app.get("/update_unit_pos", async (req, res) => {
  const id = req.query.id;
  const r_pos = req.query.r_pos;
  const q_pos = req.query.q_pos;
  await selectEntity.updateUnitPos(id, r_pos, q_pos);
  return res.send();
})

app.get("/get_moves_left", async (req, res) => {
  try {
    const id = req.query.id;
    const result = await pool.query("SELECT moves_left FROM units_state WHERE id = $1", [id]);
    return res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error getting moves left.");
  }
});

app.put("/set_moves_left", async (req, res) => {
  try {
    const { id, moves_left } = req.body;
    await pool.query("UPDATE units_state SET moves_left = $1 WHERE id = $2", [moves_left, id]);
    res.send();
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error setting moves left.");
  }
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});