const { Physics, PlayerState } = require("prismarine-physics")
const Minecraft = require("minecraft-data")
const Motion = require("./src/inject/motion")

module.exports.plugin = function inject(bot) {
    bot.physics.api = new Plugin(bot)
    Motion.inject(bot)
}

function Player() {
    this.entity = {}
    this.jumpTicks
    this.jumpQueued
    // entity properties
    this.entity.position
    this.entity.velocity
    this.entity.onGround
    this.entity.isInWater
    this.entity.isInLava
    this.entity.isInWeb
    this.entity.isCollidedHorizontally
    this.entity.isCollidedVertically

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
        return player
    }
}