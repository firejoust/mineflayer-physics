<div align="center">
  <h1>Mineflayer Physics</h1>
  <img src="https://img.shields.io/npm/v/mineflayer-physics?style=flat-square">
  <img src="https://img.shields.io/github/license/firejoust/mineflayer-physics?style=flat-square">
  <img src="https://img.shields.io/github/issues/firejoust/mineflayer-physics?style=flat-square">
  <img src="https://img.shields.io/github/issues-pr/firejoust/mineflayer-physics?style=flat-square">
</div>

### Features
#### Overview
- Predict player motion in the next tick (position, velocity, etc)
- Predict a player's control states based on their velocity
- (WIP) Simulate a player's trajectory over a period of ticks
- (WIP) Obstacle avoidance using vector based pathfinding (control states)
#### Notes
In order to get information from the last tick, this plugin will inject a new property named `lastState` into all players

(updated per tick)
### API
#### Types
```js
class PrismarineEntity; // https://github.com/PrismarineJS/prismarine-entity
class Vec3;             // https://github.com/PrismarineJS/node-vec3
```
```ts
/*
  https://github.com/PrismarineJS/mineflayer/blob/2c7103062535c12746c312371e647a7b141547bd/index.d.ts#L526-L534
*/

interface ControlStateStatus {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
  jump: boolean
  sprint: boolean
  sneak: boolean
}

interface PlayerState {
  position: Vec3,
  velocity: Vec3,
  onGround: boolean,
  isInWater: boolean,
  isInLava: boolean,
  isInWeb: boolean,
  isCollidedHorizontally: boolean,
  isCollidedVertically: boolean
}
```
#### Loading the plugin
```js
const mineflayer = require("mineflayer")
const physics = require("mineflayer-physics")

const bot = mineflayer.createBot( ... )

...

bot.loadPlugin(physics.plugin)
```
#### Methods
```js
/*
  Simulate the player's state in the next tick
  
  Arguments:
  - entity (PrismarineEntity): the player's entity
  - controlState (ControlStateStatus): the player's active control states
  
  Returns: PlayerState
*/
bot.physics.api.getPhysics(entity, controlState)

/*
  Estimate another player's control states based on their velocity
  Note that:
  - the "sprint" state has not been implemented
  - velocity applied by the server and connection latency can cause inaccuracy
  
  Arguments:
  - entity (PrismarineEntity): the player's entity
  
  returns: ControlStateStatus
*/
bot.physics.api.getControls(entity)
```
