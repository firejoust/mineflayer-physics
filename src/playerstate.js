const Physics = require("prismarine-physics")

module.exports = class PlayerState {
    static fromEntity(version, entity, controlState) {
        return new Physics.PlayerState({
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
            jumpQueued: controlState["jump"],
            version
        }, controlState)
    }

    static fromPlayer(version, entity, player, controlState) {
        return new Physics.PlayerState({
            entity: {
                position: player.entity.position.clone(),
                velocity: player.entity.velocity.clone(),
                onGround: player.entity.onGround,
                isInWater: player.entity.isInWater,
                isInLava: player.entity.isInLava,
                isInWeb: player.entity.isInWeb,
                isCollidedHorizontally: player.entity.isCollidedHorizontally,
                isCollidedVertically: player.entity.isCollidedVertically,
                attributes: entity.attributes,
                effects: entity.effects,
                yaw: entity.yaw
            },
            inventory: { slots: [] },
            jumpTicks: 0,
            jumpQueued: controlState["jump"],
            version
        }, controlState)
    }

    static fromLastState(version, entity, controlState) {
        return new Physics.PlayerState({
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
        }, controlState)
    }
}