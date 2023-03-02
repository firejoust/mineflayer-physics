const { fromEntity, fromLastState } = require("./src/playerstate")
const { Physics } = require("prismarine-physics")
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

function ControlState() {
    this.forward = false
    this.back = false
    this.left = false
    this.right = false
    this.jump = false
    this.sneak = false
    this.sprint = false
}

class Plugin {
    constructor(bot) {
        this.bot = bot
        this.physics = Physics(Minecraft(bot.majorVersion), bot.world)
    }

    getPhysics(entity, controlState) {
        const player = new Player()
        const state = fromEntity(this.bot.majorVersion, entity, controlState)

        // simulate the player into the next tick
        this.physics.simulatePlayer(state, this.bot.world).apply(player)

        // return entity state
        return player.entity
    }

    getControls(entity) {
        const player = new Player()
        const state = fromLastState(this.bot.majorVersion, entity, new ControlState())
        this.physics.simulatePlayer(state, this.bot.world).apply(player)

        /*
        // take a difference between actual pos vs simulated pos
        const diff = entity.position.minus(player.entity.position)
        console.log(Math.atan2(diff.x, diff.z) * 180/Math.PI)
        */

        const offset1 = entity.position.minus(entity.lastState.position)
        const offset2 = player.entity.position.minus(entity.lastState.position)

        const angle1 = Math.atan2(offset1.x, offset1.z) * 180/Math.PI
        const angle2 = Math.atan2(offset2.x, offset2.z) * 180/Math.PI
        console.log(`diff: ${angle2 - angle1}`) // we can use this
    }
}