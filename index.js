const { getState, getLastState } = require("./src/playerstate")
const Motion      = require("./src/inject/motion")
const Angle       = require("./src/utils/angle")

const { Physics } = require("prismarine-physics")
const Assert      = require("assert")

const States = [ "back", "left", "forward", "right" ]

module.exports.plugin = function inject(bot) {
    bot.physics.api = new Plugin(bot)
    Motion.inject(bot)
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
        this.physics = Physics(bot.registry, bot.world)
    }

    getNextState(entity, controlState) {
        const state = getState(this.bot.majorVersion, entity, controlState || new ControlState())
        return this.physics.simulatePlayer(state, this.bot.world)
    }

    getControls(entity) {
        const controls = new ControlState()

        // initialise the simulated player state
        const state = getLastState(this.bot.majorVersion, entity, new ControlState())
        this.physics.simulatePlayer(state, this.bot.world)

        // get difference between simulated pos vs. real pos
        const diff = state.pos.minus(entity.position)
        const diffAngle = Math.atan2(diff.x, diff.z)

        // jump launch
        controls["jump"] = (entity.position.y - state.pos.y) > 0
        controls["sneak"] = Boolean(entity.crouching)

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

    Simulation = (() => {
        const self = this
        return function Simulation(entity) {
            let _velocity = null
            let _controls = new ControlState()
            let _ticks    = 0
            let _callback = () => false
        
            const Set = callback => {
                return (...args) => {
                    callback(...args)
                    return this
                }
            }
        
            // fluent builder interface
            this.setVelocity = Set((x, y, z) => _velocity.set(x, y, z))
            this.setControls = Set(_ => Object.keys(_controls).forEach(control => _controls[control] = Boolean(_[control])))
            this.setTicks    = Set(_ => _ticks = _)
            this.until       = Set(_ => _callback = _)
            this.execute     = execute
        
            function execute() {
                Assert.ok(_ticks, "ticks must be at least 1")

                // initialise the next state
                const array  = new Array()
                let state = getState(self.bot.majorVersion, entity, _controls)

                // add the initial velocity (if set)
                if (_velocity)
                    state.vel.update(_velocity)

                // continue until set ticks reached
                for (let i = 0; i < _ticks; i++) {
                    self.physics.simulatePlayer(state, self.bot.world)
                    array.push(state.pos.clone())

                    // "until" condition has been met
                    if (_callback(state))
                        break
                }
                // return the player trajectory
                return array
            }
        }
    })()
}