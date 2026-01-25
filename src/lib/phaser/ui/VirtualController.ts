import Phaser from "phaser";
import { Player } from "../entities/Player";

export class VirtualController {
  private scene: Phaser.Scene;
  private player: Player;
  private container: Phaser.GameObjects.Container;

  private leftButton!: Phaser.GameObjects.Arc;
  private rightButton!: Phaser.GameObjects.Arc;
  private jumpButton!: Phaser.GameObjects.Arc;

  private leftArrow!: Phaser.GameObjects.Graphics;
  private rightArrow!: Phaser.GameObjects.Graphics;
  private jumpIcon!: Phaser.GameObjects.Graphics;

  private readonly BUTTON_ALPHA = 0.4; // 40% 투명도
  private readonly BUTTON_SIZE = 40;
  private readonly BUTTON_SPACING = 120;
  private readonly BOTTOM_MARGIN = 160;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    // 컨테이너 생성 (화면 고정)
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(200);

    this.createButtons();
    this.setupInput();
    this.updatePosition();

    // 리사이즈 이벤트
    scene.scale.on("resize", this.updatePosition, this);
  }

  private createButtons() {
    const buttonColor = 0xffffff;

    // 왼쪽 버튼
    this.leftButton = this.scene.add.circle(
      0,
      0,
      this.BUTTON_SIZE,
      buttonColor,
      this.BUTTON_ALPHA,
    );
    this.leftButton.setStrokeStyle(2, 0x000000, 0.5);
    this.leftButton.setInteractive(
      new Phaser.Geom.Circle(0, 0, this.BUTTON_SIZE),
      Phaser.Geom.Circle.Contains,
    );

    // 왼쪽 화살표 아이콘
    this.leftArrow = this.scene.add.graphics();
    this.drawArrow(this.leftArrow, -1);

    // 오른쪽 버튼
    this.rightButton = this.scene.add.circle(
      0,
      0,
      this.BUTTON_SIZE,
      buttonColor,
      this.BUTTON_ALPHA,
    );
    this.rightButton.setStrokeStyle(2, 0x000000, 0.5);
    this.rightButton.setInteractive(
      new Phaser.Geom.Circle(0, 0, this.BUTTON_SIZE),
      Phaser.Geom.Circle.Contains,
    );

    // 오른쪽 화살표 아이콘
    this.rightArrow = this.scene.add.graphics();
    this.drawArrow(this.rightArrow, 1);

    // 점프 버튼
    this.jumpButton = this.scene.add.circle(
      0,
      0,
      this.BUTTON_SIZE,
      buttonColor,
      this.BUTTON_ALPHA,
    );
    this.jumpButton.setStrokeStyle(2, 0x000000, 0.5);
    this.jumpButton.setInteractive(
      new Phaser.Geom.Circle(0, 0, this.BUTTON_SIZE),
      Phaser.Geom.Circle.Contains,
    );

    // 점프 아이콘 (위쪽 화살표)
    this.jumpIcon = this.scene.add.graphics();
    this.drawJumpIcon(this.jumpIcon);

    // 컨테이너에 추가
    this.container.add([
      this.leftButton,
      this.leftArrow,
      this.rightButton,
      this.rightArrow,
      this.jumpButton,
      this.jumpIcon,
    ]);
  }

  private drawArrow(graphics: Phaser.GameObjects.Graphics, direction: number) {
    graphics.clear();
    graphics.fillStyle(0x333333, 0.8);

    const size = 15;
    const offsetX = direction * 5;

    graphics.beginPath();
    if (direction < 0) {
      // 왼쪽 화살표
      graphics.moveTo(-size + offsetX, 0);
      graphics.lineTo(size / 2 + offsetX, -size);
      graphics.lineTo(size / 2 + offsetX, size);
    } else {
      // 오른쪽 화살표
      graphics.moveTo(size + offsetX, 0);
      graphics.lineTo(-size / 2 + offsetX, -size);
      graphics.lineTo(-size / 2 + offsetX, size);
    }
    graphics.closePath();
    graphics.fillPath();
  }

  private drawJumpIcon(graphics: Phaser.GameObjects.Graphics) {
    graphics.clear();
    graphics.fillStyle(0x333333, 0.8);

    const size = 15;

    // 위쪽 화살표
    graphics.beginPath();
    graphics.moveTo(0, -size);
    graphics.lineTo(-size, size / 2);
    graphics.lineTo(size, size / 2);
    graphics.closePath();
    graphics.fillPath();
  }

  private setupInput() {
    // 왼쪽 버튼
    this.leftButton.on("pointerdown", () => {
      this.player.setVirtualDirection(-1);
      this.leftButton.setFillStyle(0xcccccc, 0.6);
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
      this.player.setVirtualDirection(1);
      this.rightButton.setFillStyle(0xcccccc, 0.6);
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
      this.player.startCharging();
      this.jumpButton.setFillStyle(0xcccccc, 0.6);
    });
    this.jumpButton.on("pointerup", () => {
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
    this.leftArrow.setPosition(leftX, buttonY);

    // 오른쪽 버튼: 중앙
    const rightX = centerX;
    this.rightButton.setPosition(rightX, buttonY);
    this.rightArrow.setPosition(rightX, buttonY);

    // 점프 버튼: 중앙에서 오른쪽으로
    const jumpX = centerX + this.BUTTON_SPACING;
    this.jumpButton.setPosition(jumpX, buttonY);
    this.jumpIcon.setPosition(jumpX, buttonY);
  };

  // 터치 디바이스 여부 확인
  static isTouchDevice(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  destroy() {
    this.scene.scale.off("resize", this.updatePosition, this);
    this.container.destroy();
  }
}
