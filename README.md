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
  -    entity (PrismarineEntity): the player's entity
  -   walking (boolean): if the player is moving forwards
  - sprinting (boolean): if the player is sprinting
  -   jumping (boolean): if the player is jumping
  
  Returns: Vec3
*/
bot.physics.api.getVelocity(entity, walking, sprinting, jumping)
```
