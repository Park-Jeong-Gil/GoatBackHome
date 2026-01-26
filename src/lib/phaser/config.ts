import Phaser from "phaser";
import PreloadScene from "./scenes/PreloadScene";
import GameScene from "./scenes/GameScene";
import GameOverScene from "./scenes/GameOverScene";

// 기준 해상도 (이 값 기준으로 모든 좌표 계산)
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540; // 16:9 비율
export const MAP_HEIGHT = 5500;

// 모바일 감지 기준 (이 너비 이하면 모바일 모드)
export const MOBILE_BREAKPOINT = 960;

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#2a2a2a",
  pixelArt: true,
  physics: {
    default: "matter",
    matter: {
      gravity: { x: 0, y: 1 },
      debug: false,
    },
  },
  scene: [PreloadScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: "game-container",
    width: "100%",
    height: "100%",
  },
  input: {
    activePointers: 3, // 멀티터치 지원
    touch: {
      capture: true, // 터치 이벤트 캡처
    },
  },
};

// 디버그 설정 (개발 모드에서만 사용)
export const DEBUG_CONFIG = {
  // 시작 발판 번호 (null이면 0번 발판에서 시작)
  // 발판 위에 표시된 숫자를 참고하여 설정
  START_PLATFORM_INDEX: null as number | null,
  // START_PLATFORM_INDEX: 29,

  // 설표 리스폰 비활성화 (true면 한번 사라진 설표가 다시 나타나지 않음)
  DISABLE_LEOPARD_RESPAWN: true,

  // // 가상 컨트롤러 강제 표시 (true면 터치 디바이스가 아니어도 표시)
  // FORCE_VIRTUAL_CONTROLLER: true,
};

// 충돌 카테고리 (Matter.js collision filter)
export const COLLISION_CATEGORIES = {
  PLAYER: 0x0001, // 플레이어
  PLATFORM: 0x0002, // 발판
  BIRD: 0x0004, // 새 장애물
  LEOPARD: 0x0008, // 설표 장애물
};

// 충돌 마스크 (어떤 카테고리와 충돌할지)
export const COLLISION_MASKS = {
  PLAYER:
    COLLISION_CATEGORIES.PLATFORM |
    COLLISION_CATEGORIES.BIRD |
    COLLISION_CATEGORIES.LEOPARD, // 발판, 새, 설표와 충돌
  PLATFORM: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.LEOPARD, // 플레이어와 설표와 충돌
  BIRD: COLLISION_CATEGORIES.PLAYER, // 플레이어와만 충돌 (발판 통과)
  LEOPARD: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.PLATFORM, // 플레이어와 발판과 충돌
};

// 게임 상수 (테스트 후 조정 필요)
export const GAME_CONSTANTS = {
  // 플레이어 설정
  PLAYER_FRICTION: 0.005,
  PLAYER_BOUNCE: 0.2,
  MAX_JUMP_POWER: 25,
  CHARGE_RATE: 50, // per second
  HORIZONTAL_JUMP_RATIO: 0.25,

  // 발판 설정
  PLATFORM_FRICTION: {
    NORMAL: 0.1,
    ICE: 0.0005,
  },

  // 장애물 설정
  BIRD_SPEED: 100,
  BIRD_KNOCKBACK: 15,
  LEOPARD_SPEED: 150,
  LEOPARD_DETECT_RANGE: 300,

  // 카메라 설정
  CAMERA_LERP_Y: 0.1,
  FALL_CAMERA_SPEED: 1.5,
};
