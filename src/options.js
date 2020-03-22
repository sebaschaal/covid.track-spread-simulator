const DEFAULT_FILTERS = {
  symptoms: false,
  alerted: false
}

export const CANVAS_SIZE = {
  height: 880,
  width: 360
}

export const DESKTOP_CANVAS_SIZE = {
  height: 400,
  width: 800
}

export const BALL_RADIUS = 5
export const COLORS = {
  alerted: '#ffde14', //yellow
  symptoms: '#FF8C00', //orange
  recovered: '#D88DBC', //purple
  infected: '#c50000', //red
  well: '#5ABA4A' //green
}

export const STATES = {
  infected: 'infected',
  well: 'well',
  recovered: 'recovered',
  symptoms: 'symptoms',
  alerted: 'alerted'
}

export const COUNTERS = {
  ...STATES,
  'max-concurrent-infected': 'max-concurrent-infected'
}

export const STARTING_BALLS = {
  [STATES.alerted]: 0,
  [STATES.symptoms]: 0,      
  [STATES.infected]: 1,
  [STATES.well]: 199,
  [STATES.recovered]: 0,
  'max-concurrent-infected': 0
}

export const RUN = {
  filters: { ...DEFAULT_FILTERS },
  results: { ...STARTING_BALLS },
  tick: 0
}

export const MORTALITY_PERCENTATGE = 5
export const SPEED = 1
export const TOTAL_TICKS = 1600
export const TICKS_TO_RECOVER = 500 //assume 2.5 weeks
export const TICKS_TO_SYMPTOMS = 200 //asusume 1 week
export const TICKS_TO_ALERTED = 100 //assume 0.5 weeks
export const STATIC_PEOPLE_PERCENTATGE = 25

export const resetRun = () => {
  RUN.results = { ...STARTING_BALLS }
  RUN.tick = 0
}
