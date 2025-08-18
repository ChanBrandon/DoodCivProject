let { Pool } = require("pg");
let env = require("../../env.json");
let pool = new Pool(env);
const SelectEntity = require("../selectEntity");
const selectEntity = new SelectEntity(pool);

// class of functions for when a unit attacks another unit or structure
class Combat {
  constructor(pool) {
    this.pool = pool;
    this.selectEntity = selectEntity;
  }

  async attack(attackerId, victimId) {
    const attackerState = await this.selectEntity.getUnitState(attackerId);
    const attackerType = attackerState.unit_type;
    const attackerDmg = (await this.selectEntity.getUnitDamage(attackerType)).row[0].damage;

    const victimState = await this.selectEntity.getUnitState(victimId);
    const victimHP = victimState.current_health;

    // total victim health
    const totalVHP = victimHP - attackerDmg;
    if (totalVHP <= 0) {
      // temp console.log, delete when our game is playable
      console.log(`Unit ${victimId} Defeated!`);
      // await this.selectEntity.removeUnit({ id: victimId});
      await this.selectEntity.removeUnit(victimId);
    } else {
      // temp console.log, delete when our game is playable
      console.log(`Unit ${victimId} New HP: ${totalVHP}`);
      await this.selectEntity.updateUnitHealth(victimId, totalVHP);
    }

    await this.selectEntity.updateUnitMove(attackerId, false);

    return { victimId, hp: Math.max(totalVHP, 0) }
  }

  // checks the attack range of a unit across the tiles
  // a_q: attacker column position
  // a_r: attacker row position
  // a_range: range of attacker from units_data
  // v_q: victim column position
  // v_r: victim row position
  async check_range(a_q, a_r, a_range, v_q, v_r) {
    const a_s = -a_q - a_r;
    const v_s = -v_q - v_r;

    const dist = Math.max(Math.abs(a_q - v_q), Math.abs(a_r - v_r), Math.abs(a_s - v_s));
    return dist <= a_range;
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

