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
        // Example use: select name from units_data where name='scout';
        // let command = `SELECT name FROM units_data WHERE name='${unitType}'`;
        let command = `SELECT * FROM units_data WHERE name = $1`;
        let unit = await pool.query(command, [unitName]);
        return unit.rows[0];
    }

    // Inserts the current state of the unit into the units_state table
    // Should be called when a turn ends
    // unit: A JSON containing: id, unit_type, current_health, map_pos, owned_by
    async putUnit(unit) {
        let command = `INSERT INTO units_state(id, unit_type, current_health, map_pos, owned_by) VALUES($1, $2, $3, $4, $5)`;
        await pool.query(command, unit.id, unit.unit_type, unit.current_health, unit.map_pos, unit.owned_by);
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

    // Deletes the structure from the structures_state table
    // Should be called when the structure is defeated
    // unit: A JSON containing: id, structure_type, current_health, map_pos, owned_by
    async removeUnit(struct) {
        let command = `DELETE FROM structures_state WHERE id = $1`;
        await pool.query(command, struct.id);
    }


}

module.exports = SelectEntity;

