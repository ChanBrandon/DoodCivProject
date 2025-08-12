let { Pool } = require("pg");
let env = require("../../env.json");
let pool = new Pool(env);

class SelectEntity {
    constructor(pool) {
        this.pool = pool;

    }
    
    // Retrieves units from the units_data table
    // For situations when a player/AI buys a new unit
    // unitName: the name of the unit
    // Returns the unit retrieved
    async getNewUnit(unitName) {
        // Example use: select * from units_data where name='scout';
        let command = `SELECT * FROM units_data WHERE name = $1`;
        let unit = await pool.query(command, [unitName]);
        return unit.rows[0];
    }

    // Inserts the a new unit into the units_state table
    // Should be called when a new unit is bought
    // unit: A JSON containing: id, unit_type, current_health
    // pos: the position the unit will be on
    async initiateUnit(unit, pos, player) {
        let command = `INSERT INTO units_state(id, unit_type, current_health, map_pos, owned_by) VALUES($1, $2, $3, $4, $5)`;
        await pool.query(command, [unit.id, unit.unit_type, unit.current_health, pos, player]);
    }

    // renamed putUnit and changed it since the below function was identical 
    // // Creates instance of given unit type in units_state
    // // Should be called when new unit is bought
    // // unit: A JSON containing data on given unit, unit type, obtained from unit_data by getNewUnit
    // async initiateUnit(unit, pos, player) {
    //     let command =  `INSERT INTO units_state(id ,unit_type, current_health, map_pos, owned_by) VALUES ($1, $2, $3, $4, $5)`;
    //     await pool.query(command, [unit.name, unit.health, pos, player]);
    // }

    // gets the unit on the board using the id of that unit
    async getUnitState(id) {
        let command = `SELECT * FROM units_state WHERE id = $1`;
        let unit = await pool.query(command, id);
        return unit;
    }

    // gets the unit on the board using the name of that unit
    // from units_state
    async getUnitRange(name) {
        let command = `SELECT attack_range FROM units_data WHERE name = $1`;
        let range = await pool.query(command, name);
        return range;
    }

    // from units_data
    async getUnitDamage(name) {
        let command = `SELECT damage FROM units_data WHERE name = $1`;
        let damage = await pool.query(command, name);
        return damage;
    }
    
    // from units_state
    async getUnitHealth(id) {
        let command = `SELECT current_health FROM units_state WHERE id = $1`;
        let health = await pool.query(command, id);
        return health;
    }

    // Updates unit health in units_state
    // Should be called when unit takes damage
    async updateUnitHealth(id, health) {
        let command = `UPDATE units_state SET current_health = $1 WHERE id = $2`;
        await pool.query(command, health, id);
    }

    async getUnitPosition(id) {
        let command = `SELECT map_pos FROM units_state WHERE id = $1`;
        let pos = await pool.query(command, id);
        return pos;
    }

    async getUnitMovement() {
        let command = `SELECT move_range FROM units_data WHERE name = $1`;
        let pos = await pool.query(command, id);
        return pos;
    }

    // Updates unit map position in units_state
    // Should be called when unit moves
    async updateUnitPos(id, pos) {
        let command = `UPDATE units_state SET map_pos = $1 WHERE id = $2`;
        await pool.query(command, pos, id);
    }

    // id: id of the unit
    // move: bool that represents if the unit can move or not 
    async updateUnitMove(id, move) {
        let command = `UPDATE units_state SET can_move = $1 WHERE id = $2`;
        await pool.query(command, move, id)
    }

    // Deletes the unit from the units_state table
    // Should be called when the unit is defeated
    // unit: A JSON containing: id, unit_type, current_health, map_pos, owned_by
    async removeUnit(unit) {
        let command = `DELETE FROM units_state WHERE id = $1`;
        await pool.query(command, unit.id);
    }

    // Retrieves structures from the structures_data table
    // For situations when a player/AI buys a new structure 
    // structName: the name of the structure 
    // Returns the structure retrieved
    async getNewStruct(structName) {
        let command = `SELECT name FROM structures_data WHERE name = $1`;
        let struct = await pool.query(command, structName)
        return struct;
    }

    // Inserts the current state of the structure into the structures_state table
    // Should be called when a turn ends
    // struct: A JSON containing: id, structure_type, current_health, map_pos, owned_by
    async putStruct(struct) {
        let command = `INSERT INTO structures_state(id, structure_type, current_health, map_pos, owned_by) VALUES($1, $2, $3, $4, $5)`;
        await pool.query(command, struct.id, struct.structure_type, struct.current_health, struct.map_pos, struct.owned_by); 
    }

    async selectStructState(id) {
        let command = `SELECT * FROM structures_state WHERE id = $1`;
        let struct = await pool.query(command, id)
        return struct;
    }

    // Deletes the structure from the structures_state table
    // Should be called when the structure is defeated
    // unit: A JSON containing: id, structure_type, current_health, map_pos, owned_by
    async removeUnit(struct) {
        let command = `DELETE FROM structures_state WHERE id = $1`;
        await pool.query(command, struct.id);
    }


}

module.exports = SelectEntity;

