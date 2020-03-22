import {
  BALL_RADIUS,
  COLORS,
  MORTALITY_PERCENTATGE,
  TICKS_TO_RECOVER,
  TICKS_TO_SYMPTOMS,
  TICKS_TO_ALERTED,
  RUN,
  SPEED,
  STATES
} from './options.js'
import { checkCollision, calculateChangeDirection } from './collisions.js'

const diameter = BALL_RADIUS * 2

export class Ball {
  constructor ({ x, y, id, state, sketch, hasMovement }) {
    this.x = x
    this.y = y
    this.vx = sketch.random(-1, 1) * SPEED
    this.vy = sketch.random(-1, 1) * SPEED
    this.sketch = sketch
    this.id = id
    this.state = state
    this.timeInfected = 0
    this.hasMovement = hasMovement
    this.hasCollision = true
  }

  checkState () {
    if (this.state === STATES.infected || this.state === STATES.alerted || this.state === STATES.symptoms) {
      if (this.timeInfected >= TICKS_TO_RECOVER) {
        if (RUN.filters.symptoms) {
          // go from symptoms to recovered
          RUN.results[STATES.symptoms]--
          RUN.results[STATES.recovered]++
          this.state = STATES.recovered
        }
        else if (RUN.filters.alerted) {
          // go from alerted to recovered
          RUN.results[STATES.alerted]--
          RUN.results[STATES.recovered]++
          this.state = STATES.recovered
        }
        else{
          // go from infected to recovered
          RUN.results[STATES.infected]--
          RUN.results[STATES.recovered]++
          this.state = STATES.recovered
        }
      }
      else if (this.timeInfected >= TICKS_TO_SYMPTOMS) {
        if (RUN.filters.symptoms) {
          // if filter is set, we allow that state
          if (RUN.filters.alerted && this.state === STATES.alerted) {
            // go from alerted to symptoms
            RUN.results[STATES.alerted]--
            RUN.results[STATES.symptoms]++
            this.state = STATES.symptoms
          }
          else if (this.state === STATES.infected) {
            // go from infected to symptoms
            RUN.results[STATES.infected]--
            RUN.results[STATES.symptoms]++
            this.state = STATES.symptoms
            this.hasMovement = false
          }
        }
        this.timeInfected++
      }
      else if (this.timeInfected >= TICKS_TO_ALERTED) {
        if (RUN.filters.alerted && this.state === STATES.infected) {
          // if filter is set, we allow that state
          // go from infected to alerted
          RUN.results[STATES.infected]--
          RUN.results[STATES.alerted]++
          this.state = STATES.alerted
          this.hasMovement = false
        }
        this.timeInfected++
      }
      else {
        this.timeInfected++
      }
    }
  }
        
/*
      if (RUN.filters.alerted) {
        if (this.timeInfected >= TICKS_TO_ALERTED) {
          if (this.state = STATES.infected) {
            RUN.results[STATES.infected]--
            RUN.results[STATES.alerted]++
            this.state = STATES.alerted
            this.hasMovement = false
          }

        }
      }

      if (RUN.filters.symptoms) {
        if (this.timeInfected >= TICKS_TO_SYMPTOMS) {
          if (this.state = STATES.infected) {
            RUN.results[STATES.infected]--
            RUN.results[STATES.symptoms]++
            this.state = STATES.symptoms
            this.hasMovement = false
          }
          if (this.state = STATES.alerted) {
            RUN.results[STATES.alerted]--
            RUN.results[STATES.symptoms]++
            this.state = STATES.symptoms
            this.hasMovement = false
          }

        }
      }

      if (this.timeInfected >= TICKS_TO_RECOVER) {
        if (this.state = STATES.infected) {
          RUN.results[STATES.infected]--
        }
        if (this.state = STATES.symptoms) {
          RUN.results[STATES.symptoms]--
        }
        if (this.state = STATES.alerted) {
          RUN.results[STATES.alerted]--
        }
        RUN.results[STATES.recovered]++
      } 
      else {
        this.timeInfected++
      }
*/

  checkCollisions ({ others }) {
    for (let i = this.id + 1; i < others.length; i++) {
      const otherBall = others[i]
      const { state, x, y } = otherBall

      const dx = x - this.x
      const dy = y - this.y

      if (checkCollision({ dx, dy, diameter: BALL_RADIUS * 2 })) {
        const { ax, ay } = calculateChangeDirection({ dx, dy })

        //modified conservation of pulse for static object (reduced by factor of 4)
        if (otherBall.hasMovement) {
          this.vx -= ax
          this.vy -= ay
        }
        else {
          this.vx -= ax/4
          this.vy -= ay/4
        }

        if (this.hasMovement) {
          otherBall.vx = ax
          otherBall.vy = ay
        }
        else {
          otherBall.vx = ax/4
          otherBall.vy = ay/4
        }

        // both has same state, so nothing to do
        if (this.state === otherBall.state) return
        // if any is recovered, then nothing happens
        if (this.state === STATES.recovered || otherBall.state === STATES.recovered) return
        //if this ball is infected and the other healthy
        if ((this.state === STATES.infected || this.state === STATES.alerted || this.state === STATES.symptoms) && otherBall.state === STATES.well) {
          otherBall.state = STATES.infected
          RUN.results[STATES.infected]++
          RUN.results[STATES.well]--
        }
        //if other ball is infected and this one is healthy
        if ((otherBall.state === STATES.infected || otherBall.state === STATES.alerted || otherBall.state === STATES.symptoms) && this.state === STATES.well) {
          this.state = STATES.infected
          RUN.results[STATES.infected]++
          RUN.results[STATES.well]--
        }
      }
    }
  }

  move () {
    if (!this.hasMovement) return

    this.x += this.vx
    this.y += this.vy

    // check horizontal walls
    if (
      (this.x + BALL_RADIUS > this.sketch.width && this.vx > 0) ||
      (this.x - BALL_RADIUS < 0 && this.vx < 0)) {
      this.vx *= -1
    }

    // check vertical walls
    if (
      (this.y + BALL_RADIUS > this.sketch.height && this.vy > 0) ||
      (this.y - BALL_RADIUS < 0 && this.vy < 0)) {
      this.vy *= -1
    }
  }

  render () {
    const color = COLORS[this.state]
    this.sketch.noStroke()
    this.sketch.fill(color)
    this.sketch.ellipse(this.x, this.y, diameter, diameter)
  }
}
