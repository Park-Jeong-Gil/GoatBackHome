import Phaser from "phaser";
import { Player } from "../entities/Player";

export class VirtualController {
  private scene: Phaser.Scene;
  private player: Player;

  private leftButton!: Phaser.GameObjects.Arc;
  private rightButton!: Phaser.GameObjects.Arc;
  private jumpButton!: Phaser.GameObjects.Arc;

  private leftArrow!: Phaser.GameObjects.Graphics;
  private rightArrow!: Phaser.GameObjects.Graphics;
  private jumpIcon!: Phaser.GameObjects.Graphics;

  private readonly BUTTON_ALPHA = 0.5;
  private readonly BUTTON_SIZE = 50; // 터치 영역 확대
  private readonly BUTTON_SPACING = 120;
  private readonly BOTTOM_MARGIN = 120;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    this.createButtons();
    this.setupInput();
    this.updatePosition();

    // 리사이즈 이벤트
    scene.scale.on("resize", this.updatePosition, this);
  }

  private createButtons() {
    const buttonColor = 0xffffff;

    // 왼쪽 버튼 (Container 없이 직접 생성)
    this.leftButton = this.scene.add.circle(0, 0, this.BUTTON_SIZE, buttonColor, this.BUTTON_ALPHA);
    this.leftButton.setStrokeStyle(3, 0x000000, 0.6);
    this.leftButton.setScrollFactor(0);
    this.leftButton.setDepth(200);
    this.leftButton.setInteractive({ useHandCursor: false });

    // 왼쪽 화살표 아이콘
    this.leftArrow = this.scene.add.graphics();
    this.leftArrow.setScrollFactor(0);
    this.leftArrow.setDepth(201);

    // 오른쪽 버튼
    this.rightButton = this.scene.add.circle(0, 0, this.BUTTON_SIZE, buttonColor, this.BUTTON_ALPHA);
    this.rightButton.setStrokeStyle(3, 0x000000, 0.6);
    this.rightButton.setScrollFactor(0);
    this.rightButton.setDepth(200);
    this.rightButton.setInteractive({ useHandCursor: false });

    // 오른쪽 화살표 아이콘
    this.rightArrow = this.scene.add.graphics();
    this.rightArrow.setScrollFactor(0);
    this.rightArrow.setDepth(201);

    // 점프 버튼
    this.jumpButton = this.scene.add.circle(0, 0, this.BUTTON_SIZE, buttonColor, this.BUTTON_ALPHA);
    this.jumpButton.setStrokeStyle(3, 0x000000, 0.6);
    this.jumpButton.setScrollFactor(0);
    this.jumpButton.setDepth(200);
    this.jumpButton.setInteractive({ useHandCursor: false });

    // 점프 아이콘 (위쪽 화살표)
    this.jumpIcon = this.scene.add.graphics();
    this.jumpIcon.setScrollFactor(0);
    this.jumpIcon.setDepth(201);
  }

  private drawArrow(graphics: Phaser.GameObjects.Graphics, x: number, y: number, direction: number) {
    graphics.clear();
    graphics.fillStyle(0x333333, 0.9);

    const size = 18;
    const offsetX = direction * 5;

    graphics.beginPath();
    if (direction < 0) {
      // 왼쪽 화살표
      graphics.moveTo(x - size + offsetX, y);
      graphics.lineTo(x + size / 2 + offsetX, y - size);
      graphics.lineTo(x + size / 2 + offsetX, y + size);
    } else {
      // 오른쪽 화살표
      graphics.moveTo(x + size + offsetX, y);
      graphics.lineTo(x - size / 2 + offsetX, y - size);
      graphics.lineTo(x - size / 2 + offsetX, y + size);
    }
    graphics.closePath();
    graphics.fillPath();
  }

  private drawJumpIcon(graphics: Phaser.GameObjects.Graphics, x: number, y: number) {
    graphics.clear();
    graphics.fillStyle(0x333333, 0.9);

    const size = 18;

    // 위쪽 화살표
    graphics.beginPath();
    graphics.moveTo(x, y - size);
    graphics.lineTo(x - size, y + size / 2);
    graphics.lineTo(x + size, y + size / 2);
    graphics.closePath();
    graphics.fillPath();
  }

  private setupInput() {
    // 왼쪽 버튼
    this.leftButton.on("pointerdown", () => {
      console.log("Left button pressed"); // 디버그용
      this.player.setVirtualDirection(-1);
      this.leftButton.setFillStyle(0xaaaaaa, 0.7);
    });
    this.leftButton.on("pointerup", () => {
      this.player.setVirtualDirection(0);
      this.leftButton.setFillStyle(0xffffff, this.BUTTON_ALPHA);
    });
    this.leftButton.on("pointerout", () => {
      this.player.setVirtualDirection(0);
      this.leftButton.setFillStyle(0xffffff, this.BUTTON_ALPHA);
    });

    // 오른쪽 버튼
    this.rightButton.on("pointerdown", () => {
      console.log("Right button pressed"); // 디버그용
      this.player.setVirtualDirection(1);
      this.rightButton.setFillStyle(0xaaaaaa, 0.7);
    });
    this.rightButton.on("pointerup", () => {
      this.player.setVirtualDirection(0);
      this.rightButton.setFillStyle(0xffffff, this.BUTTON_ALPHA);
    });
    this.rightButton.on("pointerout", () => {
      this.player.setVirtualDirection(0);
      this.rightButton.setFillStyle(0xffffff, this.BUTTON_ALPHA);
    });

    // 점프 버튼
    this.jumpButton.on("pointerdown", () => {
      console.log("Jump button pressed"); // 디버그용
      this.player.startCharging();
      this.jumpButton.setFillStyle(0xaaaaaa, 0.7);
    });
    this.jumpButton.on("pointerup", () => {
      console.log("Jump button released"); // 디버그용
      this.player.releaseJump();
      this.jumpButton.setFillStyle(0xffffff, this.BUTTON_ALPHA);
    });
    this.jumpButton.on("pointerout", () => {
      this.player.releaseJump();
      this.jumpButton.setFillStyle(0xffffff, this.BUTTON_ALPHA);
    });
  }

  private updatePosition = () => {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    const centerX = width / 2;
    const buttonY = height - this.BOTTOM_MARGIN;

    // 왼쪽 버튼: 중앙에서 왼쪽으로
    const leftX = centerX - this.BUTTON_SPACING;
    this.leftButton.setPosition(leftX, buttonY);
    this.drawArrow(this.leftArrow, leftX, buttonY, -1);

    // 오른쪽 버튼: 중앙
    const rightX = centerX;
    this.rightButton.setPosition(rightX, buttonY);
    this.drawArrow(this.rightArrow, rightX, buttonY, 1);

    // 점프 버튼: 중앙에서 오른쪽으로
    const jumpX = centerX + this.BUTTON_SPACING;
    this.jumpButton.setPosition(jumpX, buttonY);
    this.drawJumpIcon(this.jumpIcon, jumpX, buttonY);
  };

  // 터치 디바이스 여부 확인
  static isTouchDevice(): boolean {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  destroy() {
    this.scene.scale.off("resize", this.updatePosition, this);
    this.leftButton.destroy();
    this.rightButton.destroy();
    this.jumpButton.destroy();
    this.leftArrow.destroy();
    this.rightArrow.destroy();
    this.jumpIcon.destroy();
  }
}
