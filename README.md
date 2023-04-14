<div align="center">
  <h1>Mineflayer Physics</h1>
  <img src="https://img.shields.io/npm/v/mineflayer-physics?style=flat-square">
  <img src="https://img.shields.io/github/license/firejoust/mineflayer-physics?style=flat-square">
  <img src="https://img.shields.io/github/issues/firejoust/mineflayer-physics?style=flat-square">
  <img src="https://img.shields.io/github/issues-pr/firejoust/mineflayer-physics?style=flat-square">
</div>

### Features
#### Overview
- Get a player's state in the next tick (position, velocity, etc)
- Predict a player's control states based on their current/last state
- Simulate a player's trajectory over a period of time (ticks)
#### Note:
This plugin will inject a new property named `lastState` into all players
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
  pos: Vec3,
  vel: Vec3,
  onGround: boolean,
  isInWater: boolean,
  isInLava: boolean,
  isInWeb: boolean?,
  isCollidedHorizontally: boolean,
  isCollidedVertically: boolean,
  jumpTicks: number,
  jumpQueued: boolean,
  attributes: Object,
  yaw: number,
  control: ControlStateStatus,
  jumpBoost: number,
  speed: number,
  slowness: number,
  dolphinsGrace: number,
  slowFalling: number,
  levitation: number,
  depthStrider: number
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
  Get the player's state in the next tick
  
  Arguments:
  - entity (PrismarineEntity): the player's entity
  - controlState (ControlStateStatus): the player's active control states
  
  Returns: PlayerState
*/
bot.physics.getNextState(entity, controlState)

/*
  Predict another player's control states based on their velocity
  
  Note that:
  - the "sprint" state has not been implemented
  - velocity applied by the server and connection latency can cause inaccuracy
  
  Arguments:
  - entity (PrismarineEntity): the player's entity
  
  Returns: ControlStateStatus
*/
bot.physics.getControls(entity)
```
#### Player Simulation
```js
/*
  Simulate a player's motion over a period of ticks.
  
  Arguments:
  - entity (PrismarineEntity) the player's entity
  
  Setters:
  - velocity: - initial velocity in the x, y, z direction
  - controls: - the control states enabled in the simulation
  - yaw:      - the yaw angle used during the simulation
  - ticks:    - how long the simulation will execute for
  - until:    - the callback function; simulation will continue until this returns true
*/

const Simulation = new bot.physics.Simulation(entity)
  .velocity(x, y, z)
  .controls(controls)
  .yaw(yaw)
  .ticks(ticks) 
  .until(state => true)
```
#### Running the Simulation
```ts
/*
  Executes the simulation and returns the callback status
*/
const status: boolean = Simulation.execute()

/*
  Executes the simulation and returns the player's position in each tick
*/
const trajectory: Vec3[] = Simulation.trajectory()
```
