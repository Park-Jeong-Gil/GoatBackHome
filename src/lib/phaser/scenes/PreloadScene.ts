import Phaser from 'phaser'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // 로딩 텍스트
    const loadingText = this.add.text(width / 2, height / 2 - 40, 'Loading Game...', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
    })
    loadingText.setOrigin(0.5, 0.5)

    // 염소 이모지 (펄스 애니메이션 효과)
    const goatText = this.add.text(width / 2, height / 2 + 20, '🐐', {
      fontSize: '48px',
    })
    goatText.setOrigin(0.5, 0.5)

    // 펄스 애니메이션
    this.tweens.add({
      targets: goatText,
      scale: { from: 1, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    })

    // 진행률 바 (이전 스타일 - 큰 박스)
    const barWidth = 320
    const barHeight = 50
    const barX = (width - barWidth) / 2
    const barY = height / 2 + 60

    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(barX, barY, barWidth, barHeight)

    const progressBar = this.add.graphics()

    // 로딩 진행률 표시
    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      progressBar.fillRect(barX + 10, barY + 10, (barWidth - 20) * value, barHeight - 20)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      goatText.destroy()
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
