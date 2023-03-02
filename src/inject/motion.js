module.exports.inject = bot => {
    stateHandler(bot)
}

function stateHandler(bot) {
    // noop
    let nextTick = () => {}

    bot.on("physicsTick", function update() {
        // get all entities in the current tick
        const entities = Object.values(bot.entities)

        // run the previous tick (update state from the last tick)
        nextTick()

        // initialise lastState if not already set
        for (let entity of entities)
            if (entity.type === "player")
                entity._lastState = entity._lastState === undefined
                ? new EntityState(entity)
                : updateStates(entity)

        // copy the saved state from the last tick
        nextTick = function tick() {
            for (let entity of entities)
                if (entity.type === "player")
                    entity.lastState = entity.lastState === undefined
                    ? new EntityState(entity._lastState)
                    : copyStates(entity)
        }
    })
}

// black magic 🪄

function EntityState(state) {
    this.position  = state.position.clone()
    this.velocity  = state.velocity.clone()
    this.onGround  = state.onGround
    this.isInWater = state.isInWater
    this.isInLava  = state.isInLava
    this.isInWeb   = state.isInWeb
    this.isCollidedHorizontally = state.isCollidedHorizontally
    this.isCollidedVertically   = state.isCollidedVertically
}

function updateStates(entity) {
    entity._lastState.position  = entity.position.clone()
    entity._lastState.velocity  = entity.velocity.clone()
    entity._lastState.onGround  = entity.onGround
    entity._lastState.isInWater = entity.isInWater
    entity._lastState.isInLava  = entity.isInLava
    entity._lastState.isInWeb   = entity.isInWeb
    entity._lastState.isCollidedHorizontally = entity.isCollidedHorizontally
    entity._lastState.isCollidedVertically   = entity.isCollidedVertically
    return entity._lastState
}

function copyStates(entity) {
    entity.lastState.position  = entity._lastState.position.clone()
    entity.lastState.velocity  = entity._lastState.velocity.clone()
    entity.lastState.onGround  = entity._lastState.onGround
    entity.lastState.isInWater = entity._lastState.isInWater
    entity.lastState.isInLava  = entity._lastState.isInLava
    entity.lastState.isInWeb   = entity._lastState.isInWeb
    entity.lastState.isCollidedHorizontally = entity._lastState.isCollidedHorizontally
    entity.lastState.isCollidedVertically   = entity._lastState.isCollidedVertically
    return entity.lastState
}
