module.exports.inject = bot => {
    injectMotion(bot)
}

function injectMotion(bot) {
    // init with noop
    let nextTickLastPos  = () => {}

    bot.on("physicsTick", function update () {
        tickLastPos(bot, nextTickLastPos)
    })
}

function tickLastPos(bot, nextTick) {
    // get all entities in the current tick
    const entities = Object.values(bot.entities)

    // run the previous tick (set last position & velocity)
    nextTick()

    // clone the current position
    for (let entity of entities) {
        entity._position = entity.position.clone()
        entity.lastPos = entity.lastPos
        || entity.position.clone() // set initial value
    }

    // update the nextTick function (gc won't clean up entities)
    nextTick = function tick() {
        for (let entity of entities)
            entity.lastPos.update(entity._position)
    }
}