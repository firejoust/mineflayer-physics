<div align="center">
  <h1>Mineflayer Physics</h1>
  <img src="https://img.shields.io/npm/v/mineflayer-physics?style=flat-square">
  <img src="https://img.shields.io/github/license/firejoust/mineflayer-physics?style=flat-square">
  <img src="https://img.shields.io/github/issues/firejoust/mineflayer-physics?style=flat-square">
  <img src="https://img.shields.io/github/issues-pr/firejoust/mineflayer-physics?style=flat-square">
</div>

### Features
#### Overview
- Predict player velocity in the current tick (supports attributes & effects)
- (WIP) Simulate a player's trajectory over a period of time
- (WIP) Get applicable control states for long jumps (airborne obstacle avoidance)
#### Notes
In order to get velocity in the last tick, this plugin will inject a new property named `lastPos` into all entities

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

// NOTE: currently only forward, sprint & jump are supported

interface ControlStateStatus {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
  jump: boolean
  sprint: boolean
  sneak: boolean
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
  Get the player's velocity in the current tick
  
  Arguments:
  - entity (PrismarineEntity): the player's entity
  - controlState (ControlStateStatus): the player's active control states
  
  Returns: Vec3
*/
bot.physics.api.getVelocity(entity, controlState)
```
