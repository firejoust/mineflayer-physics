const { Physics, PlayerState } = require("prismarine-physics")
const Minecraft = require("node-minecraft-data")
const Motion = require("./src/inject/motion")

module.exports.plugin = function inject(bot) {
    bot.physics.api = new Plugin(bot)
    Motion.inject(bot)
}

function Player() {
    this.position
    this.velocity
    this.onGround
    this.isInWater
    this.isInLava
    this.isInWeb
    this.isCollidedHorizontally
    this.isCollidedVertically
    this.jumpTicks
    this.jumpQueued
}

class Plugin {
    constructor(bot) {
        this.bot = bot
        this.physics = Physics(Minecraft(bot.version), bot.world)
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
                yaw: entity.yaw
            },
            jumpTicks: 0,
            jumpQueued: controlState["jump"]
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