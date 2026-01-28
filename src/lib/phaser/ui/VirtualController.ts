import Phaser from "phaser";
import { Player } from "../entities/Player";

export class VirtualController {
  private scene: Phaser.Scene;
  private player: Player;

  private leftButton!: Phaser.GameObjects.Image;
  private rightButton!: Phaser.GameObjects.Image;
  private jumpButton!: Phaser.GameObjects.Image;

  private readonly BUTTON_ALPHA = 0.7;
  private readonly BUTTON_PRESSED_ALPHA = 1;
  private readonly BUTTON_SCALE = 1; // 픽셀 아이콘 크기 조절
  private readonly DIRECTION_GAP = 100; // 방향키 간 간격
  private readonly SIDE_MARGIN = 80; // 화면 가장자리 여백
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
    // 왼쪽 버튼 (side_icon을 flip해서 사용)
    this.leftButton = this.scene.add.image(0, 0, "ui_side");
    this.leftButton.setFlipX(true); // 왼쪽을 향하도록 반전
    this.leftButton.setScale(this.BUTTON_SCALE);
    this.leftButton.setAlpha(this.BUTTON_ALPHA);
    this.leftButton.setScrollFactor(0);
    this.leftButton.setDepth(200);
    this.leftButton.setInteractive({ useHandCursor: false });

    // 오른쪽 버튼 (side_icon 그대로 사용)
    this.rightButton = this.scene.add.image(0, 0, "ui_side");
    this.rightButton.setScale(this.BUTTON_SCALE);
    this.rightButton.setAlpha(this.BUTTON_ALPHA);
    this.rightButton.setScrollFactor(0);
    this.rightButton.setDepth(200);
    this.rightButton.setInteractive({ useHandCursor: false });

    // 점프 버튼 (up_icon 사용)
    this.jumpButton = this.scene.add.image(0, 0, "ui_up");
    this.jumpButton.setScale(this.BUTTON_SCALE);
    this.jumpButton.setAlpha(this.BUTTON_ALPHA);
    this.jumpButton.setScrollFactor(0);
    this.jumpButton.setDepth(200);
    this.jumpButton.setInteractive({ useHandCursor: false });
  }

  private setupInput() {
    // 왼쪽 버튼
    this.leftButton.on("pointerdown", () => {
      this.player.setVirtualDirection(-1);
      this.leftButton.setAlpha(this.BUTTON_PRESSED_ALPHA);
    });
    this.leftButton.on("pointerup", () => {
      this.player.setVirtualDirection(0);
      this.leftButton.setAlpha(this.BUTTON_ALPHA);
    });
    this.leftButton.on("pointerout", () => {
      this.player.setVirtualDirection(0);
      this.leftButton.setAlpha(this.BUTTON_ALPHA);
    });

    // 오른쪽 버튼
    this.rightButton.on("pointerdown", () => {
      this.player.setVirtualDirection(1);
      this.rightButton.setAlpha(this.BUTTON_PRESSED_ALPHA);
    });
    this.rightButton.on("pointerup", () => {
      this.player.setVirtualDirection(0);
      this.rightButton.setAlpha(this.BUTTON_ALPHA);
    });
    this.rightButton.on("pointerout", () => {
      this.player.setVirtualDirection(0);
      this.rightButton.setAlpha(this.BUTTON_ALPHA);
    });

    // 점프 버튼
    this.jumpButton.on("pointerdown", () => {
      this.player.startCharging();
      this.jumpButton.setAlpha(this.BUTTON_PRESSED_ALPHA);
    });
    this.jumpButton.on("pointerup", () => {
      this.player.releaseJump();
      this.jumpButton.setAlpha(this.BUTTON_ALPHA);
    });
    this.jumpButton.on("pointerout", () => {
      this.player.releaseJump();
      this.jumpButton.setAlpha(this.BUTTON_ALPHA);
    });
  }

  private updatePosition = () => {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const buttonY = height - this.BOTTOM_MARGIN;

    // 왼쪽에 방향키 두 개 (⬅️ ➡️)
    this.leftButton.setPosition(this.SIDE_MARGIN, buttonY);
    this.rightButton.setPosition(
      this.SIDE_MARGIN + this.DIRECTION_GAP,
      buttonY,
    );

    // 오른쪽에 점프 버튼 (⬆️)
    this.jumpButton.setPosition(width - this.SIDE_MARGIN, buttonY + -10);
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
  }
}
