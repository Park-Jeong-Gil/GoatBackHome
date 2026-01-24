import Phaser from 'phaser'
import { COLLISION_CATEGORIES, COLLISION_MASKS, GAME_CONSTANTS } from '../config'
import { ObstacleData } from '@/types/game.d'

export class Bird extends Phaser.Physics.Matter.Sprite {
  private startX: number
  private startY: number
  private moveRange: number
  private moveSpeed: number
  private direction: number = 1 // 1: 오른쪽, -1: 왼쪽

  constructor(scene: Phaser.Scene, data: ObstacleData) {
    super(scene.matter.world, data.x, data.y, 'bird')

    this.startX = data.x
    this.startY = data.y
    this.moveRange = data.range || 200
    this.moveSpeed = data.speed || GAME_CONSTANTS.BIRD_SPEED

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

  destroy(fromScene?: boolean) {
    super.destroy(fromScene)
  }
}
