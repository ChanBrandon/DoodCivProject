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
  // uses the idea of the Manhattan Distance
  // attkpos: uses the position of the unit
  // attkMovement: how far a unit can move
  // range: how far the unit can attack
  // vPos: the position of the victim
  async check_range(attkPos, attkMovement, range, vPos) {
    let threatRange = attkMovement + range;
    // calculate the manhattan distance using threatRange and vPos

    // return true if
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

