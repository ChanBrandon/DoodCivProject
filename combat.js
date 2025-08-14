let { Pool } = require("pg");
let env = require("../../env.json");
let pool = new Pool(env);
const SelectEntity = require("./selectEntity");
const selectEntity = new SelectEntity(pool);

// class of functions for when a unit attacks another unit or structure
class Combat {
  constructor(pool) {
    this.pool = pool;
  }

  async attack(attackerDmg, victimHP) {
    // get attacker attack stat
    // get victim health
    // apply attack to victim health
    // if victim health <= 0, print something idk, then delete victim
    // otherwise update victim health
    // update the attacker to not be able to move (unit turn ended)

    // total victim health
    let totalVHP = victimHP - attackerDmg;
    if (totalVHP <= 0) {
      // temp console.log, delete when our game is playable
      console.log("Enemy Unit Defeated!");
      await selectEntity.removeUnit(victimId);
    } else {
      // temp console.log, delete when our game is playable
      console.log(totalVHP);
      await await selectEntity.updateUnitHealth(id, totalVHP);
      await selectEntity.updateUnitMove(id, false);
    }
  }

  // checks the attack range of a unit across the tiles
  // a_q: attacker column position
  // a_r: attacker row position
  // a_range: range of attacker from units_data
  // v_q: victim column position
  // v_r: victim row position
  async check_range(a_q, a_r, a_range, v_q, v_r) {

    let dist = Math.abs(a_q - v_q) + Math.abs(a_r - v_r) + (a_q - v_q + a_r - v_r)
    if (dist == a_range) {
      // means unit can attack
      return true;
    }
    // means unit cannot attack
    return false;
  }

  // returns true if enemy is detected within the unit's range
  // returns false if no enemy is within range
  // from units_state
  async can_attack(id) {
    let command = `SELECT can_move FROM units_state WHERE id = $1`;
    let boolVal = await pool.query(command, pos, id);
    return boolVal;
  }
}

module.exports = Combat;

