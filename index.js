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
        let final = speed

        // apply modifiers to final value
        mod.forEach(modifier => {
            if (modifier.operation === 0) // add
                final += modifier.amount
            else
                if (modifier.operation === 1) // multiply base
                    final += speed * (1 + modifier.amount)
                else
                    if (modifier.operation === 2) // multiply
                        final += speed * modifier.amount
        })

        return 10 * final
    }

    getJumpBoost(entity) {
        for (let id in entity.effects)
            if (id == 8)
                return entity.effects[id].amplifier * 0.1
        return 0
    }

    getVelocity(entity, controlState) {
        const st = entity.onGround ? this.getSlip(entity.position) : 1
        const su = entity.onGround ? this.getSlip(entity.lastPos)  : 1
        const m  = this.getMovement(entity)

        // calculate momentum component
        let xm, zm
        xm = (entity.position.x - entity.lastPos.x) * su * 0.91
        zm = (entity.position.z - entity.lastPos.z) * su * 0.91

        // calculate acceleration component
        let xa, za
        if (controlState["forward"]) {
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
        x = xm + xa + (entity.onGround && controlState["sprint"] && controlState["jump"] ? 0.2 * -Math.sin(entity.yaw) : 0)
        z = zm + za + (entity.onGround && controlState["sprint"] && controlState["jump"] ? 0.2 * -Math.cos(entity.yaw) : 0)

        let y = entity.onGround && controlState["jump"]
        ? 0.42 + this.getJumpBoost(entity)
        : (entity.position.y - entity.lastPos.y - 0.08) * 0.98

        if (entity.onGround && y < 0.003)
            y = 0

        return new Vec3(x, y, z)
    }
}