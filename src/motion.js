const StateProperties = [
    'yaw',
    'onGround',
    'isInWater',
    'isInLava',
    'isInWeb',
    'isCollidedHorizontally',
    'isCollidedVertically'
]

function State(state) {
    this.position = state.position.clone()
    this.velocity = state.velocity.clone()
    StateProperties.forEach(property => {
        this[property] = state[property]
    })
}

function saveState(entity) {
    entity._lastState.position = entity.position.clone()
    entity._lastState.velocity = entity.velocity.clone()
    StateProperties.forEach(property => {
        entity._lastState[property] = entity[property]
    })
}

function copyState(entity) {
    entity.lastState.position = entity._lastState.position.clone()
    entity.lastState.velocity = entity._lastState.velocity.clone()
    StateProperties.forEach(property => {
        entity.lastState[property] = entity._lastState[property]
    })
}

module.exports.inject = function inject(bot) {
    let nextTick = new function() {
        this.execute = () => {}
    }

    bot.on("physicsTick", function update() {
        nextTick.execute()
        tick(bot, nextTick)
    })
}

function tick(bot, nextTick) {
    // initialise the last state in the current tick
    {
        const entities = Object.values(bot.entities)

        entities.forEach(entity => {
            if (entity.type === "player") {
                if (entity._lastState === undefined) {
                    entity._lastState = new State(entity)
                    entity.lastState  = new State(entity)
                } else {
                    saveState(entity)
                }
            }
        })
    }

    // update the last state in the next tick
    {
        const entities = Object.values(bot.entities)

        function tick() {
            entities.forEach(entity => {
                if (entity.type === "player") {
                    if (entity.lastState === undefined) {
                        entity.lastState = new State(entity._lastState)
                    } else {
                        entity.lastState = copyState(entity)
                    }
                }
            })
        }

        nextTick.execute = tick
    }
}