// 게임 타입 정의

export interface PlatformData {
  x: number
  y: number
  texture: 'platform' | 'platform_ice' | 'platform_tilted'
  width?: number
  friction?: number
  angle?: number
  isGoal?: boolean
}

export interface ObstacleData {
  type: 'bird' | 'leopard' | 'movingPlatform'
  x: number
  y: number
  pattern: 'horizontal' | 'vertical' | 'chase'
  speed: number
  range?: number
}

export interface GameState {
  nickname: string
  isPlaying: boolean
  currentHeight: number
  elapsedTime: number
  jumpPower: number
  isCharging: boolean
}

export interface ScoreData {
  id: string
  nickname: string
  clear_time: number
  max_height: number
  created_at: string
}

export interface GameConfig {
  gravity: { x: number; y: number }
  playerFriction: number
  playerBounce: number
  maxJumpPower: number
  chargeRate: number
}
