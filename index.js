const Vec3 = require("vec3")
const motion = require("./src/inject/motion")

module.exports.plugin = function inject(bot) {
    bot.physics.api = new Plugin(bot)
    motion.inject(bot)
}

class Plugin {
    constructor(bot) {
        this.bot = bot
    }

    getSlip(location) {
        const block = this.bot.blockAt(location.offset(0, -1, 0))
        return block.name === "slime_block" ? 0.8
             : block.name === "ice"         ? 0.98
             : block.name === "packed_ice"  ? 0.98
             : block.name === "blue_ice"    ? 0.989
             : 0.6
    }

    getMovement(entity) {
        if (entity.attributes === undefined) return 1.0
        const speed = entity.attributes["minecraft:generic.movement_speed"].value
        const mod   = entity.attributes["minecraft:generic.movement_speed"].modifiers

        // multiply has base or non-base operation
        const multiplier_base = []
        const multiplier_none = []
        let degree_add = 0

        // collect attribute modifier values
        mod.forEach(modifier => {
            if (modifier.operation === 0) // add
                degree_add += modifier.amount
            else
                if (modifier.operation === 1) // multiply base
                    multiplier_base.push(modifier.amount)
                else
                    if (modifier.operation === 2) // multiply
                        multiplier_none.push(modifier.amount)
        })

        // apply modifiers to final value
        let final = speed
        multiplier_base.forEach(i => final += speed * (1 + i))
        multiplier_none.forEach(i => final += speed * i)
        final += degree_add

        // todo: crouch
        return final * 10
    }

    getJumpBoost(entity) {
        for (let id in entity.effects)
            if (id == 8)
                return entity.effects[id].amplifier * 0.1
        return 0
    }

    getVelocity(entity, walking, sprinting, jumping) {
        const st = entity.onGround ? this.getSlip(entity.position) : 1
        const su = entity.onGround ? this.getSlip(entity.lastPos)  : 1
        const m  = this.getMovement(entity)

        // calculate momentum component
        let xm, zm
        xm = (entity.position.x - entity.lastPos.x) * su * 0.91
        zm = (entity.position.z - entity.lastPos.z) * su * 0.91

        // calculate acceleration component
        let xa, za
        if (walking) {
            xa = entity.onGround
            ? 0.1 * m * (0.6/st) ** 3 * -Math.sin(entity.yaw)
            : 0.02 * m * -Math.sin(entity.yaw)

            za = entity.onGround
            ? 0.1 * m * (0.6/st) ** 3 * -Math.cos(entity.yaw)
            : 0.02 * m * -Math.cos(entity.yaw)
        } else
            xa = za = 0

        // calculate velocity
        let x, z
        x = xm + xa + (entity.onGround && sprinting && jumping ? 0.2 * -Math.sin(entity.yaw) : 0)
        z = zm + za + (entity.onGround && sprinting && jumping ? 0.2 * -Math.cos(entity.yaw) : 0)

        let y = entity.onGround && jumping
        ? 0.42 + this.getJumpBoost(entity)
        : (entity.position.y - entity.lastPos.y - 0.08) * 0.98

        if (entity.onGround && y < 0.003)
            y = 0

        return new Vec3(x, y, z)
    }
}