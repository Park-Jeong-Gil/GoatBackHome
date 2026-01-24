// 게임 타입 정의

// 발판 모양 타입
export type PlatformShape =
  | 'flat'        // ━ 기본 평평한 발판
  | 'L'           // ┗ ㄴ 모양 (왼쪽 벽)
  | 'L_reverse'   // ┛ ㄱ 모양 (오른쪽 벽)
  | 'T'           // ┻ ㅜ 모양 (양쪽 벽)
  | 'slope_up'    // ╱ 오르막 (양 끝 평지 포함)
  | 'slope_down'  // ╲ 내리막 (양 끝 평지 포함)

export interface PlatformData {
  x: number
  y: number
  texture: 'platform' | 'platform_ice' | 'platform_tilted'
  width?: number
  height?: number  // L, T 모양의 벽 높이
  friction?: number
  angle?: number   // flat 타입에서만 사용 (기존 호환)
  shape?: PlatformShape  // 발판 모양 (기본: flat)
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
