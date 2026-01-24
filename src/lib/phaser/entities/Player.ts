import Phaser from 'phaser'
import { GAME_CONSTANTS, MAP_HEIGHT } from '../config'

export class Player extends Phaser.Physics.Matter.Sprite {
  private jumpPower: number = 0
  private isCharging: boolean = false
  private maxPower: number = GAME_CONSTANTS.MAX_JUMP_POWER
  public isGrounded: boolean = false
  public isOnGoalPlatform: boolean = false

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private spaceKey!: Phaser.Input.Keyboard.Key

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'goat')

    scene.add.existing(this)

    // 물리 설정 (회전 허용 - 착지 시 정방향으로 복원)
    this.setFriction(GAME_CONSTANTS.PLAYER_FRICTION)
    this.setBounce(GAME_CONSTANTS.PLAYER_BOUNCE)

    // 충돌 바디 크기 조정 (스프라이트보다 약간 작게)
    this.setBody({
      type: 'rectangle',
      width: 28,
      height: 28,
    })

    // 회전 저항 설정 (너무 빨리 회전하지 않도록)
    this.setFrictionAir(0.01)

    // 입력 설정
    this.setupInput()
  }

  private setupInput() {
    if (!this.scene.input.keyboard) return

    this.cursors = this.scene.input.keyboard.createCursorKeys()
    this.spaceKey = this.scene.input.keyboard.addKey('SPACE')

    // 점프 차징
    this.spaceKey.on('down', () => {
      if (this.isGrounded) {
        this.isCharging = true
      }
    })

    this.spaceKey.on('up', () => {
      if (this.isCharging) {
        this.jump()
        this.isCharging = false
        this.jumpPower = 0
      }
    })
  }

  // 현재 방향키 상태 확인
  private getDirection(): number {
    if (!this.cursors) return 0
    if (this.cursors.left.isDown) return -1
    if (this.cursors.right.isDown) return 1
    return 0
  }

  update(delta: number) {
    // 차징 중 파워 증가
    if (this.isCharging && this.isGrounded) {
      this.jumpPower = Math.min(
        this.jumpPower + (GAME_CONSTANTS.CHARGE_RATE * delta) / 1000,
        this.maxPower
      )

      // 파워 게이지 이벤트 발생 (0-1 범위)
      this.scene.events.emit('powerChanged', this.jumpPower / this.maxPower)
    }

    // 착지 상태 업데이트 (바닥 접촉 감지)
    this.updateGroundedState()
  }

  private updateGroundedState() {
    // 속도가 매우 작고 아래쪽으로 움직이지 않으면 착지 상태로 판정
    const velocity = this.body?.velocity as Phaser.Math.Vector2
    if (velocity) {
      // 착지 판정은 충돌 이벤트에서 처리
      // 여기서는 공중에 떠 있는지만 체크
      if (Math.abs(velocity.y) > 0.5) {
        // 움직이고 있으면 착지 아님 (단, 충돌 이벤트에서 오버라이드 가능)
      }
    }
  }

  private jump() {
    if (!this.isGrounded) return

    // 점프 시점에 방향키 상태 확인
    const direction = this.getDirection()
    const power = this.jumpPower
    const dirX = direction * GAME_CONSTANTS.HORIZONTAL_JUMP_RATIO * power
    const dirY = -power

    this.setVelocity(dirX, dirY)
    this.isGrounded = false

    // 점프 방향에 따라 회전력 추가 (자연스러운 점프 모션)
    if (direction !== 0) {
      this.setAngularVelocity(direction * 0.1)
    }

    // 점프 실행 이벤트
    this.scene.events.emit('jumpExecuted')
  }

  getHeight(): number {
    // 시작 지점 대비 높이 (m 단위)
    const startY = MAP_HEIGHT
    return Math.max(0, Math.round((startY - this.y) / 10))
  }

  getJumpPower(): number {
    return this.jumpPower
  }

  getMaxPower(): number {
    return this.maxPower
  }

  isCurrentlyCharging(): boolean {
    return this.isCharging
  }

  setGrounded(grounded: boolean, isGoal: boolean = false) {
    this.isGrounded = grounded
    this.isOnGoalPlatform = isGoal

    // 착지 시 정방향으로 회전 복원
    if (grounded) {
      this.setAngle(0)
      this.setAngularVelocity(0)
    }
  }

  // 넉백 (새에게 맞았을 때)
  applyKnockback(directionX: number, force: number) {
    this.setVelocity(directionX * force, -force * 0.5)
    this.isGrounded = false
  }
}
