import { PlatformData, ObstacleData } from "@/types/game.d";
import { SnowLeopardData } from "../entities/SnowLeopard";

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

// 설표 데이터 - 특정 발판 위에 배치
export const snowLeopardData: SnowLeopardData[] = [
  // 10번 발판 (x: 700, y: 4000)
  {
    platformIndex: 10,
    x: 700,
    y: 4000 - 30,
    detectRange: 375, // 250 * 1.5
    speed: 150,
  },
  // 17번 발판 (x: 280, y: 2950)
  {
    platformIndex: 17,
    x: 280,
    y: 2950 - 30,
    detectRange: 420, // 280 * 1.5
    speed: 170,
  },
  // 26번 발판 (x: 700, y: 1600)
  {
    platformIndex: 26,
    x: 700,
    y: 1600 - 30,
    detectRange: 450, // 300 * 1.5
    speed: 180,
  },
];

// ============================================
// 모바일 전용 맵 데이터 (960px 이하)
// 점프 높이와 간격을 고려하여 난이도 조정
// ============================================

// 모바일 발판 데이터 (y좌표 내림차순: 아래 → 위)
// - 발판 간격: 100~180 (데스크톱보다 좁게)
// - 발판 폭: 100~180 (착지하기 쉽게)
// - x 좌표: 480 중심으로 ±350 범위 (화면 중앙 집중)
export const mobileMapData: PlatformData[] = [
  // 0: 시작 지점
  { x: 480, y: 5492, texture: "platform", width: 960, shape: "flat" },
  // 1
  { x: 350, y: 5350, texture: "platform", width: 140, shape: "flat" },
  // 2
  { x: 620, y: 5220, texture: "platform", width: 150, shape: "flat" },
  // 3
  { x: 200, y: 5080, texture: "platform", width: 160, shape: "flat" },
  // 4
  { x: 500, y: 4950, texture: "platform", width: 140, shape: "flat" },
  // 5
  { x: 750, y: 4820, texture: "platform", width: 150, shape: "flat" },
  // 6
  { x: 400, y: 4680, texture: "platform", width: 160, shape: "slope_up" },
  // 7
  { x: 180, y: 4550, texture: "platform", width: 140, shape: "flat" },
  // 8
  { x: 600, y: 4420, texture: "platform", width: 150, shape: "flat" },
  // 9
  { x: 350, y: 4280, texture: "platform", width: 160, shape: "flat" },
  // 10
  { x: 700, y: 4150, texture: "platform", width: 140, shape: "flat" },
  // 11
  { x: 250, y: 4020, texture: "platform_ice", width: 150, shape: "flat" },
  // 12
  { x: 550, y: 3880, texture: "platform", width: 160, shape: "flat" },
  // 13
  { x: 780, y: 3750, texture: "platform", width: 140, shape: "slope_down" },
  // 14
  { x: 400, y: 3620, texture: "platform", width: 150, shape: "flat" },
  // 15
  { x: 150, y: 3490, texture: "platform", width: 160, shape: "flat" },
  // 16
  { x: 500, y: 3360, texture: "platform_ice", width: 140, shape: "flat" },
  // 17
  { x: 750, y: 3220, texture: "platform", width: 150, shape: "flat" },
  // 18
  { x: 300, y: 3090, texture: "platform", width: 160, shape: "flat" },
  // 19
  { x: 600, y: 2960, texture: "platform", width: 140, shape: "slope_up" },
  // 20
  { x: 200, y: 2830, texture: "platform", width: 150, shape: "flat" },
  // 21
  { x: 480, y: 2700, texture: "platform", width: 160, shape: "flat" },
  // 22
  { x: 700, y: 2560, texture: "platform", width: 140, shape: "flat" },
  // 23
  { x: 350, y: 2430, texture: "platform_ice", width: 150, shape: "flat" },
  // 24
  { x: 580, y: 2300, texture: "platform", width: 160, shape: "flat" },
  // 25
  { x: 180, y: 2170, texture: "platform", width: 140, shape: "slope_down" },
  // 26
  { x: 450, y: 2040, texture: "platform", width: 150, shape: "flat" },
  // 27
  { x: 700, y: 1910, texture: "platform", width: 160, shape: "flat" },
  // 28
  { x: 300, y: 1780, texture: "platform", width: 140, shape: "flat" },
  // 29
  { x: 550, y: 1650, texture: "platform", width: 150, shape: "flat" },
  // 30
  { x: 200, y: 1520, texture: "platform_ice", width: 160, shape: "flat" },
  // 31
  { x: 520, y: 1390, texture: "platform", width: 140, shape: "flat" },
  // 32
  { x: 730, y: 1260, texture: "platform", width: 150, shape: "slope_up" },
  // 33
  { x: 350, y: 1130, texture: "platform", width: 160, shape: "flat" },
  // 34
  { x: 600, y: 1000, texture: "platform", width: 140, shape: "flat" },
  // 35
  { x: 260, y: 870, texture: "platform", width: 150, shape: "flat" },
  // 36
  { x: 580, y: 740, texture: "platform", width: 160, shape: "flat" },
  // 37: 골인 지점
  {
    x: 480,
    y: 600,
    texture: "platform",
    width: 120,
    shape: "flat",
    isGoal: true,
  },
];

// 모바일 장애물 데이터 - 새 (수 감소, 속도/범위 조정)
export const mobileObstacleData: ObstacleData[] = [
  {
    type: "bird",
    x: 480,
    y: 3600,
    pattern: "horizontal",
    speed: 6,
    range: 150,
  },
  {
    type: "bird",
    x: 400,
    y: 2400,
    pattern: "horizontal",
    speed: 7,
    range: 140,
  },
  {
    type: "bird",
    x: 280,
    y: 800,
    pattern: "horizontal",
    speed: 5,
    range: 280,
  },
];

// 모바일 설표 데이터 (수 감소)
export const mobileSnowLeopardData: SnowLeopardData[] = [
  // 10번 발판 (x: 700, y: 4150)
  {
    platformIndex: 10,
    x: 700,
    y: 4150 - 30,
    detectRange: 350,
    speed: 140,
  },
  // 27번 발판 (x: 700, y: 1910)
  {
    platformIndex: 27,
    x: 700,
    y: 1910 - 30,
    detectRange: 380,
    speed: 160,
  },
];

// ============================================
// 헬퍼 함수
// ============================================

// 발판 생성 헬퍼 함수 (기존 호환용)
export function getTextureForPlatform(platform: PlatformData): string {
  if (platform.isGoal) return "platform_goal";
  return platform.texture;
}

// 발판 너비 계산 (기존 호환용)
export function getPlatformWidth(platform: PlatformData): number {
  return platform.width || 64;
}

// 화면 크기에 따른 맵 데이터 반환
export function getMapDataForScreen(isMobile: boolean): PlatformData[] {
  return isMobile ? mobileMapData : mapData;
}

// 화면 크기에 따른 장애물 데이터 반환
export function getObstacleDataForScreen(isMobile: boolean): ObstacleData[] {
  return isMobile ? mobileObstacleData : obstacleData;
}

// 화면 크기에 따른 설표 데이터 반환
export function getSnowLeopardDataForScreen(
  isMobile: boolean,
): SnowLeopardData[] {
  return isMobile ? mobileSnowLeopardData : snowLeopardData;
}
