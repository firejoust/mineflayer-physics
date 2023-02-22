const Vec3 = require("vec3")
const motion = require("./src/inject/motion")

module.exports.plugin = function inject(bot) {
    bot.physics = new Plugin(bot)
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

    getEffects(entity) {
        let speed = 0
        let slowness = 0

        for (let effect of entity.effects) {
            if (effect.id === 1) speed = effect.amplifier
            if (effect.id === 2) slowness = effect.amplifier
        }

        return (1 + 0.2 * speed) * (1 - 0.15 * slowness)
    }

    getMovement(entity) {
        const speed = entity.attributes["minecraft:generic.movement_speed"].value
        const mod   = entity.attributes["minecraft:generic.movement_speed"].modifiers
        // multiply has base or non-base operation
        let multipliers = []
        let base = true

        // final value modifiers
        let degree_mult = 0
        let degree_add  = 0

        // get add degree, gather multiply candidates
        mod.forEach(modifier => {
            if (modifier.operation === 0)
                degree_add += modifier.amount
            else {
                if (modifier.operation === 2) base = false
                multipliers.push(modifier.amount)
            }
        })

        // get the degree using multiply candidates
        if (base) {
            degree_mult = 1
            multipliers.forEach(i => degree_mult += i)
        } else
            multipliers.forEach(i => degree_mult += (1 + i))

        return (speed * degree_mult + degree_add) *
        entity.crouching ? 0.3 : 1
    }

    getJumpBoost(entity) {
        for (let effect of entity.effects) {
            if (effect.id === 8) return effect.amplifier * 0.2
        }
        return 0
    }

    getVelocity(entity, walking, sprinting, jumping) {
        const st = entity.onGround ? this.getSlip(entity.position) : 1
        const su = entity.onGround ? this.getSlip(entity.lastPos)  : 1
        const m  = this.getMovement(entity)
        const e  = this.getEffects(entity)

        // calculate momentum component
        let xm, zm
        xm = (entity.position.x - entity.lastPos.x) * su * 0.91
        zm = (entity.position.z - entity.lastPos.z) * su * 0.91

        // calculate acceleration component
        let xa, za
        if (walking) {
            xa = entity.onGround
            ? 0.1 * m * e * (0.6/st) ** 3 * Math.sin(entity.yaw)
            : 0.02 * m * Math.sin(entity.yaw)

            za = entity.onGround
            ? 0.1 * m * e * (0.6/st) ** 3 * Math.cos(entity.yaw)
            : 0.02 * m * Math.cos(entity.yaw)
        } else
            xa = za = 0

        // calculate velocity
        let x, z
        x = xm + xa + (entity.onGround && sprinting && jumping ? 0.2 : 0)
        z = zm + za + (entity.onGround && sprinting && jumping ? 0.2 : 0)

        let y = entity.onGround && jumping
        ? 0.42 + this.getJumpBoost(entity)
        : (entity.position.y - entity.lastPos.y - 0.08) * 0.98

        return new Vec3(x, y, z)
    }
}