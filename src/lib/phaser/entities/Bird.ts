import Phaser from 'phaser'
import { COLLISION_CATEGORIES, COLLISION_MASKS, GAME_CONSTANTS } from '../config'
import { ObstacleData } from '@/types/game.d'

export class Bird extends Phaser.Physics.Matter.Sprite {
  private startX: number
  private startY: number
  private moveRange: number
  private baseSpeed: number // 기본 속도 (스케일 적용 전)
  private moveSpeed: number // 실제 이동 속도 (스케일 적용 후)
  private direction: number = 1 // 1: 오른쪽, -1: 왼쪽
  private screenScaleX: number = 1 // 화면 비율

  constructor(scene: Phaser.Scene, data: ObstacleData, scaleX: number = 1) {
    super(scene.matter.world, data.x, data.y, 'bird')

    this.screenScaleX = scaleX
    this.startX = data.x
    this.startY = data.y
    this.moveRange = data.range || 200
    this.baseSpeed = data.speed || GAME_CONSTANTS.BIRD_SPEED
    this.moveSpeed = this.baseSpeed * this.screenScaleX

    scene.add.existing(this)

    // 물리 바디 설정
    this.setBody({
      type: 'rectangle',
      width: 32,
      height: 24,
    })

    // 정적이 아닌 동적 바디로 설정하되, 중력 영향 없음
    this.setIgnoreGravity(true)
    this.setFixedRotation()

    // 충돌 카테고리 설정 - 플레이어와만 충돌 (발판 통과)
    this.setCollisionCategory(COLLISION_CATEGORIES.BIRD)
    this.setCollidesWith(COLLISION_MASKS.BIRD)

    // 라벨 설정 (충돌 감지용)
    const body = this.body as MatterJS.BodyType
    if (body) {
      body.label = 'bird'
    }

    // 초기 방향 설정 (좌우 랜덤)
    this.direction = Math.random() > 0.5 ? 1 : -1
    this.setFlipX(this.direction < 0)
  }

  update() {
    // 좌우 이동
    const newX = this.x + this.moveSpeed * this.direction * 0.016 // delta 근사치

    // 범위 체크 및 방향 전환
    if (newX > this.startX + this.moveRange) {
      this.direction = -1
      this.setFlipX(true)
    } else if (newX < this.startX - this.moveRange) {
      this.direction = 1
      this.setFlipX(false)
    }

    // x축 속도만 설정 (y는 고정)
    this.setVelocityX(this.moveSpeed * this.direction)
    this.setVelocityY(0) // y 고정
  }

  // 플레이어와 충돌 시 넉백 방향 반환
  getKnockbackDirection(): number {
    return this.direction
  }

  // 화면 비율 업데이트 (리사이즈 시)
  setScreenScaleX(scaleX: number) {
    this.screenScaleX = scaleX
    this.moveSpeed = this.baseSpeed * this.screenScaleX
  }

  // startX 업데이트 (리사이즈 시 이동 범위 조정용)
  setStartX(x: number) {
    this.startX = x
  }

  destroy(fromScene?: boolean) {
    super.destroy(fromScene)
  }
}
