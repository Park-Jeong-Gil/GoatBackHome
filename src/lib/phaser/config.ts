import Phaser from 'phaser'
import PreloadScene from './scenes/PreloadScene'
import GameScene from './scenes/GameScene'
import GameOverScene from './scenes/GameOverScene'

export const GAME_WIDTH = 800
export const GAME_HEIGHT = 600
export const MAP_HEIGHT = 5000

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  pixelArt: true,
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 1 },
      debug: process.env.NODE_ENV === 'development',
    },
  },
  scene: [PreloadScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

// 게임 상수 (테스트 후 조정 필요)
export const GAME_CONSTANTS = {
  // 플레이어 설정
  PLAYER_FRICTION: 0.005,
  PLAYER_BOUNCE: 0.2,
  MAX_JUMP_POWER: 20,
  CHARGE_RATE: 50, // per second
  HORIZONTAL_JUMP_RATIO: 0.3,

  // 발판 설정
  PLATFORM_FRICTION: {
    NORMAL: 0.1,
    ICE: 0.001,
  },

  // 장애물 설정
  BIRD_SPEED: 100,
  BIRD_KNOCKBACK: 15,
  LEOPARD_SPEED: 150,
  LEOPARD_DETECT_RANGE: 300,

  // 카메라 설정
  CAMERA_LERP_Y: 0.1,
  FALL_CAMERA_SPEED: 1.5,
}
