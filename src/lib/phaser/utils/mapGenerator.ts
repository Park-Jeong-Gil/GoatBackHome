import { PlatformData, ObstacleData } from "@/types/game.d";

// 발판 데이터 (y좌표 내림차순 정렬: 아래 → 위, 시작점 → 골인점)
export const mapData: PlatformData[] = [
  // 0: 시작 지점
  { x: 480, y: 5492, texture: "platform", width: 960, shape: "flat" },
  // 1
  { x: 300, y: 5350, texture: "platform", width: 120, shape: "flat" },
  // 2
  { x: 780, y: 5200, texture: "platform", width: 130, shape: "flat" },
  // 3
  { x: 100, y: 5050, texture: "platform", width: 160, shape: "slope_up" },
  // 4
  { x: 880, y: 4850, texture: "platform", width: 120, shape: "L_reverse" },
  // 5
  { x: 500, y: 4750, texture: "platform", width: 150, shape: "flat" },
  // 6
  { x: 220, y: 4450, texture: "platform", width: 140, shape: "flat" },
  // 7
  { x: 620, y: 4300, texture: "platform", width: 150, shape: "slope_up" },
  // 8
  { x: 880, y: 4200, texture: "platform", width: 110, shape: "T" },
  // 9
  { x: 280, y: 4150, texture: "platform", width: 140, shape: "flat" },
  // 10
  { x: 700, y: 4000, texture: "platform", width: 130, shape: "flat" },
  // 11
  { x: 80, y: 3850, texture: "platform", width: 130, shape: "flat" },
  // 12
  { x: 600, y: 3700, texture: "platform_ice", width: 140, shape: "flat" },
  // 13
  { x: 340, y: 3550, texture: "platform", width: 130, shape: "slope_down" },
  // 14
  { x: 880, y: 3300, texture: "platform_ice", width: 100, shape: "flat" },
  // 15
  { x: 200, y: 3250, texture: "platform", width: 130, shape: "flat" },
  // 16
  { x: 620, y: 3100, texture: "platform_ice", width: 120, shape: "flat" },
  // 17
  { x: 280, y: 2950, texture: "platform", width: 120, shape: "flat" },
  // 18
  { x: 700, y: 2800, texture: "platform", width: 120, shape: "slope_up" },
  // 19
  { x: 80, y: 2700, texture: "platform", width: 100, shape: "T" },
  // 20
  { x: 880, y: 2400, texture: "platform", width: 100, shape: "L_reverse" },
  // 21
  { x: 280, y: 2350, texture: "platform", width: 110, shape: "flat" },
  // 22
  { x: 700, y: 2200, texture: "platform", width: 100, shape: "slope_down" },
  // 23
  { x: 580, y: 1900, texture: "platform", width: 100, shape: "flat" },
  // 24
  { x: 80, y: 1800, texture: "platform", width: 90, shape: "slope_up" },
  // 25
  { x: 220, y: 1750, texture: "platform_ice", width: 100, shape: "flat" },
  // 26
  { x: 700, y: 1600, texture: "platform", width: 90, shape: "flat" },
  // 27
  { x: 280, y: 1450, texture: "platform", width: 100, shape: "slope_up" },
  // 28
  { x: 700, y: 1300, texture: "platform", width: 85, shape: "flat" },
  // 29
  { x: 880, y: 1200, texture: "platform", width: 90, shape: "slope_down" },
  // 30
  { x: 160, y: 1150, texture: "platform_ice", width: 90, shape: "flat" },
  // 31
  { x: 520, y: 1000, texture: "platform", width: 100, shape: "flat" },
  // 32
  { x: 280, y: 850, texture: "platform", width: 110, shape: "flat" },
  // 33
  { x: 700, y: 700, texture: "platform", width: 120, shape: "slope_up" },
  // 34: 골인 지점
  {
    x: 480,
    y: 600,
    texture: "platform",
    width: 100,
    shape: "flat",
    isGoal: true,
  },
];

// 장애물 데이터 - 새 (좌우로 날아다니며 플레이어를 방해)
export const obstacleData: ObstacleData[] = [
  // 중간 구간 새들
  {
    type: "bird",
    x: 400,
    y: 3500,
    pattern: "horizontal",
    speed: 10,
    range: 180,
  },
  {
    type: "bird",
    x: 600,
    y: 2900,
    pattern: "horizontal",
    speed: 5,
    range: 200,
  },
  {
    type: "bird",
    x: 300,
    y: 2300,
    pattern: "horizontal",
    speed: 8,
    range: 160,
  },
  // 상단 구간 새들 (더 빠름)
  {
    type: "bird",
    x: 500,
    y: 1700,
    pattern: "horizontal",
    speed: 10,
    range: 220,
  },
  {
    type: "bird",
    x: 400,
    y: 1100,
    pattern: "horizontal",
    speed: 12,
    range: 200,
  },
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
