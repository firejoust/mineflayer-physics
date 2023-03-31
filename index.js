const State  = require("./src/state")
const Motion = require("./src/motion")
const Angle  = require("./src/angle")

const Prismarine = require("prismarine-physics")
const Assert     = require("assert")

const Controls = [ "back", "left", "forward", "right" ]

module.exports.plugin = function inject(bot) {
    const physics = new Plugin(bot)
    // inject entity handler
    Motion.inject(bot)
    // inject methods into original physics object
    bot.physics.getNextState = physics.getNextState
    bot.physics.getControls  = physics.getControls
    bot.physics.Simulation   = physics.Simulation

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

function Plugin(bot) {
    const Player  = new State(Prismarine, bot.majorVersion)
    const Physics = Prismarine.Physics(bot.registry, bot.world)

    this.getNextState = getNextState
    this.getControls  = getControls
    this.Simulation   = Simulation

    function getNextState(entity, controlState) {
        const state = Player.getState(entity, controlState || new ControlState())
        return Physics.simulatePlayer(state, bot.world)
    }

    function getControls(entity) {
        const controls = new ControlState()

        // initialise the simulated player state
        const state = Player.getLastState(entity, new ControlState())
        Physics.simulatePlayer(state, bot.world)

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
                ? controls[Controls[index]] = true
                : controls[Controls[index]] = false

                // next state
                index++
            }
        }

        return controls
    }

    function Simulation(entity) {
        let _ticks    = 0
        let _callback = () => false
        let _velocity = null
        let _yaw      = null
        let _controls = new ControlState()
    
        const Set = callback => {
            return (...args) => {
                callback(...args)
                return this
            }
        }

        // Setters
        this.ticks    = Set(_ => _ticks = _)
        this.yaw      = Set(_ => _yaw = _)
        this.until    = Set(_ => _callback = _)
        this.velocity = Set((x, y, z) => _velocity.set(x, y, z))
        this.controls = Set(_ => Object.keys(_controls).forEach(control => _controls[control] = Boolean(_[control])))

        // Getters
        this.execute    = execute
        this.trajectory = trajectory

        function execute() {
            Assert.ok(_ticks, "ticks must be at least 1")

            // initialise the next state
            const state = Player.getState(entity, _controls)

            // add the initial velocity (if set)
            if (_velocity !== null)
                state.vel.update(_velocity)

            if (_yaw !== null)
                state.yaw = _yaw

            // continue until set ticks reached
            for (let i = 0; i < _ticks; i++) {
                Physics.simulatePlayer(state, bot.world)

                // "until" condition was met
                if (_callback(state))
                    return true
            }

            return false
        }

        function trajectory() {
            Assert.ok(_ticks, "ticks must be at least 1")
            const array  = new Array()
            const state = Player.getState(entity, _controls)

            if (_velocity)
                state.vel.update(_velocity)

            for (let i = 0; i < _ticks; i++) {
                Physics.simulatePlayer(state, bot.world)
                array.push(state.pos.clone())

                if (_callback(state))
                    break
            }

            // return the player trajectory
            return array
        }
    }
}