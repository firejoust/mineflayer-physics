module.exports = function PlayerState(Prismarine, version) {
    this.getState     = getState
    this.getLastState = getLastState

    function getState(entity, controls) {
        return new Prismarine.PlayerState({
            entity: {
                position: entity.position.clone(),
                velocity: entity.velocity.clone(),
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
            jumpQueued: controls["jump"],
            version
        }, controls)
    }

    function getLastState(entity, controls) {
        return new Prismarine.PlayerState({
            entity: {
                position: entity.lastState.position.clone(),
                velocity: entity.lastState.velocity.clone(),
                onGround: entity.lastState.onGround,
                isInWater: entity.lastState.isInWater,
                isInLava: entity.lastState.isInLava,
                isInWeb: entity.lastState.isInWeb,
                isCollidedHorizontally: entity.lastState.isCollidedHorizontally,
                isCollidedVertically: entity.lastState.isCollidedVertically,
                yaw: entity.lastState.yaw,
                attributes: entity.attributes,
                effects: entity.effects
            },
            inventory: { slots: [] },
            jumpTicks: 0,
            jumpQueued: false,
            version
        }, controls)
    }
}
