const { fromEntity, fromLastState } = require("./src/playerstate")
const { Physics } = require("prismarine-physics")
const Minecraft   = require("minecraft-data")
const Motion      = require("./src/inject/motion")
const Angle       = require("./src/utils/angle")

const States = [ "back", "left", "forward", "right" ]

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
        const controls = new ControlState()

        // initialise the simulated player state
        const player = new Player()
        const state = fromLastState(this.bot.majorVersion, entity, new ControlState())
        this.physics.simulatePlayer(state, this.bot.world).apply(player)

        // get difference between simulated pos vs. real pos
        const diff = player.entity.position.minus(entity.position)
        const diffAngle = Math.atan2(diff.x, diff.z)

        // jump launch
        controls["jump"] = (entity.position.y - player.entity.position.y) > 0

        // difference between simulated/actual velocity
        if (diffAngle !== 0) {
            const angle0 = Angle.difference(diffAngle, entity.lastState.yaw)
            const angle1 = Angle.inverse(angle0)

            // control states separated by 90 degrees
            const radius = (Math.PI / 2) * 1.1 // add a bit of tolerance
            let index = 0

            // create a radius for each cardinal direction
            for (let i = -Math.PI; i < Math.PI; i += Math.PI/2) {
                // original angle radius
                let x0, x1
                x0 = i - radius / 2
                x1 = i + radius / 2
                // enable control state if destination angle within radius
                x0 <= angle0 && angle0 <= x1 || x1 <= angle0 && angle0 <= x0 ||
                x1 <= angle1 && angle1 <= x0 || x0 <= angle1 && angle1 <= x1
                ? controls[States[index]] = true
                : controls[States[index]] = false
                // next state
                index++
            }
        }

        return controls
    }
}