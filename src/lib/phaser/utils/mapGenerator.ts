import { PlatformData, ObstacleData } from "@/types/game.d";

export const mapData: PlatformData[] = [
  // ═══════════════════════════════════════════════════════════
  // 시작 지점 (화면 전체 너비)
  // ═══════════════════════════════════════════════════════════
  { x: 480, y: 4992, texture: "platform", width: 960, shape: "flat" },

  // ═══════════════════════════════════════════════════════════
  // 초반부 (높이 4000-5000) - 쉬움, 넓은 발판
  // ═══════════════════════════════════════════════════════════
  { x: 280, y: 4850, texture: "platform", width: 180, shape: "flat" },
  { x: 780, y: 4700, texture: "platform", width: 170, shape: "flat" },
  { x: 170, y: 4550, texture: "platform", width: 160, shape: "slope_up" },
  { x: 620, y: 4400, texture: "platform", width: 170, shape: "flat" },
  { x: 340, y: 4250, texture: "platform", width: 160, shape: "flat" },
  { x: 700, y: 4100, texture: "platform", width: 150, shape: "slope_down" },

  // ═══════════════════════════════════════════════════════════
  // 중반부 초입 (높이 3500-4000) - 보통
  // ═══════════════════════════════════════════════════════════
  { x: 220, y: 3950, texture: "platform", width: 140, shape: "flat" },
  { x: 620, y: 3800, texture: "platform", width: 150, shape: "slope_up" },
  { x: 280, y: 3650, texture: "platform", width: 140, shape: "flat" },
  { x: 700, y: 3500, texture: "platform", width: 130, shape: "flat" },

  // ═══════════════════════════════════════════════════════════
  // 중반부 (높이 2500-3500) - 얼음 등장
  // ═══════════════════════════════════════════════════════════
  { x: 220, y: 3350, texture: "platform", width: 130, shape: "flat" },
  {
    x: 620,
    y: 3200,
    texture: "platform_ice",
    width: 140,
    shape: "flat",
    friction: 10,
  },
  { x: 340, y: 3050, texture: "platform", width: 130, shape: "slope_down" },
  { x: 700, y: 2900, texture: "platform", width: 120, shape: "flat" },
  { x: 220, y: 2750, texture: "platform", width: 130, shape: "flat" },
  {
    x: 620,
    y: 2600,
    texture: "platform_ice",
    width: 120,
    shape: "flat",
    friction: 10,
  },

  // ═══════════════════════════════════════════════════════════
  // 후반부 (높이 1500-2500) - 어려움
  // ═══════════════════════════════════════════════════════════
  { x: 280, y: 2450, texture: "platform", width: 120, shape: "flat" },
  { x: 700, y: 2300, texture: "platform", width: 120, shape: "slope_up" },
  { x: 220, y: 2150, texture: "platform", width: 110, shape: "flat" },
  {
    x: 620,
    y: 2000,
    texture: "platform_ice",
    width: 120,
    shape: "flat",
    friction: 10,
  },
  { x: 280, y: 1850, texture: "platform", width: 110, shape: "flat" },
  { x: 700, y: 1700, texture: "platform", width: 100, shape: "slope_down" },
  { x: 220, y: 1550, texture: "platform", width: 110, shape: "flat" },

  // ═══════════════════════════════════════════════════════════
  // 최종 구간 (높이 500-1500) - 극악
  // ═══════════════════════════════════════════════════════════
  { x: 620, y: 1400, texture: "platform", width: 100, shape: "flat" },
  {
    x: 220,
    y: 1250,
    texture: "platform_ice",
    width: 100,
    shape: "flat",
    friction: 10,
  },
  { x: 700, y: 1100, texture: "platform", width: 90, shape: "flat" },
  { x: 280, y: 950, texture: "platform", width: 100, shape: "slope_up" },
  { x: 700, y: 800, texture: "platform", width: 85, shape: "flat" },
  {
    x: 220,
    y: 650,
    texture: "platform_ice",
    width: 90,
    shape: "flat",
    friction: 10,
  },
  { x: 620, y: 500, texture: "platform", width: 100, shape: "flat" },
  { x: 280, y: 350, texture: "platform", width: 110, shape: "flat" },
  { x: 700, y: 200, texture: "platform", width: 120, shape: "slope_up" },

  // ═══════════════════════════════════════════════════════════
  // 골인 지점 (착지 시 클리어)
  // ═══════════════════════════════════════════════════════════
  {
    x: 480,
    y: 50,
    texture: "platform",
    width: 300,
    shape: "flat",
    isGoal: true,
  },
];

// 장애물 데이터 (Week 2에서 구현)
export const obstacleData: ObstacleData[] = [
  // { type: 'bird', x: 400, y: 3500, pattern: 'horizontal', speed: 100, range: 200 },
  // { type: 'leopard', x: 300, y: 2500, pattern: 'chase', speed: 150 },
];

// 발판 생성 헬퍼 함수 (기존 호환용)
export function getTextureForPlatform(platform: PlatformData): string {
  if (platform.isGoal) return "platform_goal";
  return platform.texture;
}

// 발판 너비 계산 (기존 호환용)
export function getPlatformWidth(platform: PlatformData): number {
  return platform.width || 64;
}
