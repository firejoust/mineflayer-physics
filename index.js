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

    velocityXZ(velocity, slip, movement, effects, onGround) {

    }

    velocityY(velocity, slip, movement, boost) {

    }
}