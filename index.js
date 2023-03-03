const { fromEntity, fromLastState } = require("./src/playerstate")
const { Physics } = require("prismarine-physics")
const Minecraft   = require("minecraft-data")
const Motion      = require("./src/inject/motion")
const Angle       = require("./src/utils/angle")

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

        // get angle between the velocity difference
        const diff1 = entity.velocity.minus(player.entity.velocity)
        const angle1 = Math.atan2(diff1.x, diff1.z)
        const angle2 = entity.lastState.yaw

        console.log(`angle1: ${angle1 * 180/Math.PI}, angle2: ${angle2 * 180/Math.PI}`)
        console.log(`diff: ${Angle.difference(angle1, angle2) * 180/Math.PI}`)
    }
}