const { Physics, PlayerState } = require("prismarine-physics")
const Minecraft = require("minecraft-data")
const Motion = require("./src/inject/motion")

module.exports.plugin = function inject(bot) {
    bot.physics.api = new Plugin(bot)
    Motion.inject(bot)
}

function Player() {
    this.jumpTicks = null
    this.jumpQueued = null
    this.entity = {
        position: null,
        velocity: null,
        onGround: null,
        isInWater: null,
        isInLava: null,
        isInWeb: null,
        isCollidedHorizontally: null,
        isCollidedVertically: null
    }
}

class Plugin {
    constructor(bot) {
        this.bot = bot
        this.physics = Physics(Minecraft(bot.majorVersion), bot.world)
    }

    getPlayerState(entity, controlState) {
        return new PlayerState({
            entity: {
                position: entity.position.clone(),
                velocity: entity.position.minus(entity.lastPos),
                onGround: entity.onGround,
                isInWater: entity.isInWater,
                isInLava: entity.isInLava,
                isInWeb: entity.isInWeb,
                isCollidedHorizontally: entity.isCollidedHorizontally,
                isCollidedVertically: entity.isCollidedVertically,
                attributes: entity.attributes,
                effects: entity.effects,
                yaw: entity.yaw
            },
            inventory: { slots: [] },
            jumpTicks: 0,
            jumpQueued: controlState["jump"],
            version: this.bot.majorVersion
        }, controlState)
    }

    getPhysics(entity, controlState) {
        const state = this.getPlayerState(entity, controlState)
        const player = new Player()
        // update player with current physics state
        this.physics.simulatePlayer(state, this.bot.world).apply(player)
        return player.entity
    }

    getControls(entity) {
        // get lastPos and lastVel
        // compare new pos to current pos
    }
}