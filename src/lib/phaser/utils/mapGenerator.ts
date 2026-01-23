import { PlatformData, ObstacleData } from '@/types/game.d'

export const mapData: PlatformData[] = [
  // 시작 지점
  { x: 400, y: 4950, texture: 'platform', width: 200 },

  // 초반부 (높이 4000-5000) - 쉬움
  { x: 300, y: 4800, texture: 'platform' },
  { x: 500, y: 4600, texture: 'platform' },
  { x: 250, y: 4400, texture: 'platform' },
  { x: 550, y: 4200, texture: 'platform' },
  { x: 350, y: 4000, texture: 'platform' },

  // 중반부 (높이 2000-4000) - 좁은 발판
  { x: 200, y: 3800, texture: 'platform', width: 128 },
  { x: 600, y: 3600, texture: 'platform', width: 128 },
  { x: 300, y: 3400, texture: 'platform_ice', friction: 0.001 },
  { x: 500, y: 3200, texture: 'platform', width: 128 },

  // 중반부 - 기울어진 발판 등장
  { x: 400, y: 3000, texture: 'platform_tilted', angle: 15 },
  { x: 250, y: 2800, texture: 'platform', width: 128 },
  { x: 550, y: 2600, texture: 'platform_tilted', angle: -20 },

  // 후반부 (높이 1000-2000) - 어려움
  { x: 350, y: 2400, texture: 'platform', width: 96 },
  { x: 450, y: 2200, texture: 'platform_ice', width: 96, friction: 0.001 },
  { x: 200, y: 2000, texture: 'platform_tilted', angle: 30, width: 128 },

  // 최종 구간 (높이 0-1000) - 극악
  { x: 600, y: 1800, texture: 'platform', width: 64 },
  { x: 200, y: 1600, texture: 'platform', width: 64 },
  { x: 500, y: 1400, texture: 'platform_ice', width: 96 },
  { x: 300, y: 1200, texture: 'platform_tilted', angle: 45 },
  { x: 450, y: 1000, texture: 'platform', width: 64 },
  { x: 250, y: 800, texture: 'platform', width: 64 },
  { x: 550, y: 600, texture: 'platform', width: 96 },
  { x: 350, y: 400, texture: 'platform', width: 96 },
  { x: 450, y: 200, texture: 'platform', width: 128 },

  // 골인 지점 (착지 시 클리어)
  { x: 400, y: 50, texture: 'platform', width: 300, isGoal: true },
]

// 장애물 데이터 (Week 2에서 구현)
export const obstacleData: ObstacleData[] = [
  // { type: 'bird', x: 400, y: 3500, pattern: 'horizontal', speed: 100, range: 200 },
  // { type: 'leopard', x: 300, y: 2500, pattern: 'chase', speed: 150 },
]

// 발판 생성 헬퍼 함수
export function getTextureForPlatform(platform: PlatformData): string {
  if (platform.isGoal) return 'platform_goal'
  return platform.texture
}

// 발판 너비 계산
export function getPlatformWidth(platform: PlatformData): number {
  return platform.width || 64
}
