import { _decorator, Component, sp } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SpineAnimationSwitcher")
export class SpineAnimationSwitcher extends Component {
  @property
  animation1: string = "";
  //第一个动画重复的次数
  @property
  animation1Repeat: number = 1;
  @property
  animation2: string = "";
  //第二个动画重复的次数
  @property
  animation2Repeat: number = 1;

  private currentAnimation: string = "";
  private currentRepeatCount: number = 0;

  private skeleton: sp.Skeleton = null;

  constructor() {
    super();
  }

  protected onLoad(): void {
    this.skeleton = this.getComponent(sp.Skeleton);
  }

  onEnable() {
    this.currentAnimation = this.animation1;
    this.currentRepeatCount = 0;
    this.playAnimation();
  }

  private playAnimation() {
    this.skeleton.setAnimation(0, this.currentAnimation, false);

    this.scheduleOnce(() => {
      this.currentRepeatCount++;
      let repeatLimit =
        this.currentAnimation === this.animation1
          ? this.animation1Repeat
          : this.animation2Repeat;

      if (this.currentRepeatCount >= repeatLimit) {
        this.currentAnimation =
          this.currentAnimation === this.animation1
            ? this.animation2
            : this.animation1;
        this.currentRepeatCount = 0;
      }
      //递归以继续播放动画
      this.playAnimation();
    }, this.skeleton.findAnimation(this.currentAnimation).duration);
  }

  private stopAnimation() {
    this.unscheduleAllCallbacks();
  }

  onDisable() {
    this.stopAnimation();
  }
}
