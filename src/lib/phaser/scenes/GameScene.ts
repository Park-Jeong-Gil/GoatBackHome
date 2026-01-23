import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { mapData, getTextureForPlatform, getPlatformWidth } from '../utils/mapGenerator'
import { GAME_WIDTH, GAME_HEIGHT, MAP_HEIGHT, GAME_CONSTANTS } from '../config'
import { PlatformData } from '@/types/game.d'

export default class GameScene extends Phaser.Scene {
  private player!: Player
  private platforms: Phaser.Physics.Matter.Image[] = []
  private goalPlatform: Phaser.Physics.Matter.Image | null = null
  private startTime!: number
  private timerText!: Phaser.GameObjects.Text
  private heightText!: Phaser.GameObjects.Text
  private powerGauge!: Phaser.GameObjects.Graphics
  private powerGaugeBackground!: Phaser.GameObjects.Graphics

  constructor() {
    super('GameScene')
  }

  create() {
    this.startTime = Date.now()

    // 배경색 설정
    this.cameras.main.setBackgroundColor('#87CEEB')

    // 맵 경계 설정
    this.matter.world.setBounds(0, 0, GAME_WIDTH, MAP_HEIGHT)

    // 맵 생성
    this.createMap()

    // 플레이어 생성 (시작 발판 위)
    this.player = new Player(this, 400, 4900)

    // 카메라 설정
    this.cameras.main.startFollow(this.player, false, 0, GAME_CONSTANTS.CAMERA_LERP_Y)
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, MAP_HEIGHT)

    // HUD 생성
    this.createHUD()

    // 충돌 감지 설정
    this.setupCollisions()

    // 이벤트 리스너
    this.events.on('powerChanged', this.updatePowerGauge, this)
    this.events.on('jumpExecuted', this.hidePowerGauge, this)
  }

  update(time: number, delta: number) {
    this.player.update(delta)

    // HUD 업데이트
    this.updateHUD()

    // 클리어 체크
    if (this.player.isOnGoalPlatform) {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
      this.handleClear(elapsed)
    }
  }

  private createMap() {
    mapData.forEach((platform: PlatformData) => {
      const texture = getTextureForPlatform(platform)
      const width = getPlatformWidth(platform)

      const p = this.matter.add.image(platform.x, platform.y, texture)
      p.setStatic(true)
      p.setFriction(platform.friction ?? GAME_CONSTANTS.PLATFORM_FRICTION.NORMAL)

      // 크기 조정
      p.setDisplaySize(width, 16)

      // 바디 크기도 조정
      p.setBody({
        type: 'rectangle',
        width: width,
        height: 16,
      })
      p.setStatic(true)

      if (platform.angle) {
        p.setAngle(platform.angle)
      }

      // 골인 발판 표시
      if (platform.isGoal) {
        p.setData('isGoal', true)
        this.goalPlatform = p
      }

      this.platforms.push(p)
    })
  }

  private createHUD() {
    // 타이머
    this.timerText = this.add
      .text(16, 16, 'TIME: 00:00', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100)

    // 높이
    this.heightText = this.add
      .text(16, 46, 'HEIGHT: 0m', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100)

    // 파워 게이지 배경
    this.powerGaugeBackground = this.add.graphics()
    this.powerGaugeBackground.setScrollFactor(0)
    this.powerGaugeBackground.setDepth(100)
    this.powerGaugeBackground.setVisible(false)

    // 파워 게이지
    this.powerGauge = this.add.graphics()
    this.powerGauge.setScrollFactor(0)
    this.powerGauge.setDepth(101)
    this.powerGauge.setVisible(false)
  }

  private updateHUD() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    this.timerText.setText(
      `TIME: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    )
    this.heightText.setText(`HEIGHT: ${this.player.getHeight()}m`)
  }

  private updatePowerGauge(power: number) {
    // 게이지 표시
    this.powerGaugeBackground.setVisible(true)
    this.powerGauge.setVisible(true)

    // 배경 그리기
    this.powerGaugeBackground.clear()
    this.powerGaugeBackground.fillStyle(0x333333, 0.8)
    this.powerGaugeBackground.fillRect(GAME_WIDTH / 2 - 100, GAME_HEIGHT - 40, 200, 20)

    // 게이지 그리기
    this.powerGauge.clear()
    const gaugeWidth = 196 * power
    const color = power < 0.5 ? 0x00ff00 : power < 0.8 ? 0xffff00 : 0xff0000
    this.powerGauge.fillStyle(color, 1)
    this.powerGauge.fillRect(GAME_WIDTH / 2 - 98, GAME_HEIGHT - 38, gaugeWidth, 16)
  }

  private hidePowerGauge() {
    this.powerGaugeBackground.setVisible(false)
    this.powerGauge.setVisible(false)
  }

  private setupCollisions() {
    // 충돌 시작 이벤트
    this.matter.world.on(
      'collisionstart',
      (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA
          const bodyB = pair.bodyB

          // 플레이어와 발판 충돌 체크
          const playerBody = this.player.body as MatterJS.BodyType
          if (bodyA === playerBody || bodyB === playerBody) {
            const otherBody = bodyA === playerBody ? bodyB : bodyA
            const platform = this.platforms.find(
              (p) => (p.body as MatterJS.BodyType) === otherBody
            )

            if (platform) {
              const isGoal = platform.getData('isGoal') === true
              this.player.setGrounded(true, isGoal)
            }
          }
        })
      }
    )

    // 충돌 종료 이벤트
    this.matter.world.on(
      'collisionend',
      (event: Phaser.Physics.Matter.Events.CollisionEndEvent) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA
          const bodyB = pair.bodyB

          const playerBody = this.player.body as MatterJS.BodyType
          if (bodyA === playerBody || bodyB === playerBody) {
            // 약간의 딜레이 후 착지 상태 해제 (다른 발판에 바로 착지할 수 있으므로)
            this.time.delayedCall(50, () => {
              // 현재 충돌 중인 발판이 없으면 공중 상태
              const touching = this.matter.overlap(this.player, this.platforms)
              if (!touching) {
                this.player.setGrounded(false, false)
              }
            })
          }
        })
      }
    )
  }

  private handleClear(clearTime: number) {
    this.scene.pause()
    this.scene.launch('GameOverScene', {
      success: true,
      clearTime,
      height: this.player.getHeight(),
    })
  }

  // 게임오버 처리 (표범 충돌 시 호출)
  handleGameOver() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
    this.scene.pause()
    this.scene.launch('GameOverScene', {
      success: false,
      clearTime: elapsed,
      height: this.player.getHeight(),
    })
  }
}
