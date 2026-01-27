import Phaser from 'phaser'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    // 로딩 UI는 React에서 관리 - 진행률만 전달
    this.load.on('progress', (value: number) => {
      window.dispatchEvent(new CustomEvent('loadProgress', { detail: value }))
    })

    // 임시 플레이스홀더 에셋 생성 (나중에 실제 에셋으로 교체)
    this.createPlaceholderAssets()

    // 배경 이미지 로드
    this.load.image('mountains', '/assets/backgrounds/mountains.webp')

    // 산양 상태별 이미지 로드
    this.load.image('goat_idle', '/assets/sprites/goat_idle.png')
    this.load.image('goat_ready', '/assets/sprites/goat_ready.png')
    this.load.image('goat_jump', '/assets/sprites/goat_jump.png')
    this.load.image('goat_fall', '/assets/sprites/goat_fall.png')
    this.load.image('goat_land', '/assets/sprites/goat_land.png')

    // 새 이미지 로드 (2프레임 애니메이션용)
    this.load.image('bird_01', '/assets/obstacles/bird_01.png')
    this.load.image('bird_02', '/assets/obstacles/bird_02.png')

    // 설표 이미지 로드 (상태별)
    this.load.image('leopard_stay', '/assets/obstacles/leopard_stay.png')
    this.load.image('leopard_run', '/assets/obstacles/leopard_run.png')

    // 발판 이미지 로드 (랜덤 선택용)
    for (let i = 1; i <= 10; i++) {
      this.load.image(`platform_${i}`, `/assets/platform/platform_${i}.png`)
    }
  }

  create() {
    this.scene.start('GameScene')
  }

  private createPlaceholderAssets() {
    // 발판 플레이스홀더 (64x16 갈색 사각형)
    const platformGraphics = this.make.graphics({ x: 0, y: 0 })
    platformGraphics.fillStyle(0x8b4513, 1)
    platformGraphics.fillRect(0, 0, 64, 16)
    platformGraphics.generateTexture('platform', 64, 16)
    platformGraphics.destroy()

    // 얼음 발판 플레이스홀더 (64x16 진한 파란색 + 반투명 효과)
    const iceGraphics = this.make.graphics({ x: 0, y: 0 })
    // 진한 파란색 배경
    iceGraphics.fillStyle(0x2196f3, 1)
    iceGraphics.fillRect(0, 0, 64, 16)
    // 반짝이는 하이라이트 추가
    iceGraphics.fillStyle(0x64b5f6, 0.7)
    iceGraphics.fillRect(2, 2, 60, 4)
    iceGraphics.fillStyle(0xbbdefb, 0.5)
    iceGraphics.fillRect(4, 4, 20, 2)
    iceGraphics.fillRect(30, 4, 15, 2)
    iceGraphics.generateTexture('platform_ice', 64, 16)
    iceGraphics.destroy()

    // 기울어진 발판 플레이스홀더
    const tiltedGraphics = this.make.graphics({ x: 0, y: 0 })
    tiltedGraphics.fillStyle(0x654321, 1)
    tiltedGraphics.fillRect(0, 0, 64, 16)
    tiltedGraphics.generateTexture('platform_tilted', 64, 16)
    tiltedGraphics.destroy()

    // 골인 발판 플레이스홀더 (금색)
    const goalGraphics = this.make.graphics({ x: 0, y: 0 })
    goalGraphics.fillStyle(0xffd700, 1)
    goalGraphics.fillRect(0, 0, 300, 16)
    goalGraphics.generateTexture('platform_goal', 300, 16)
    goalGraphics.destroy()
  }
}
