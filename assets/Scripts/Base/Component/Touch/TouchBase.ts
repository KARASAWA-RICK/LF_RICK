import { _decorator, Component, EventTouch, Node, Vec2, Vec3 } from "cc";
import { Debug, VecTools } from "../../Tools";
const { ccclass, property } = _decorator;

@ccclass("TouchBase")
export abstract class TouchBase extends Component {
  //是否可交互
  @property
  isInteractable: boolean = true;
  //最近一次触摸位置
  protected lastTouchPos: Vec3 = null;
  //当前触摸位置
  protected currentTouchPos: Vec3 = null;
  //最近一次移动的[距离，角度]
  protected lastMove: [number, number] = [0, 0];

  //开始
  onTouchStart(event: EventTouch): boolean {
    if (!this.isInteractable) {
      return false;
    }
    this.isInteractable = false;
    this.updateMove(event);
    this.synchroPos();
    this.touchStartExecute();
    return true;
  }

  protected abstract touchStartExecute();

  //取消
  onTouchCancel(event?: EventTouch): boolean {
    if (this.isInteractable) {
      return false;
    }
    this.touchCanelExecute();
    this.isInteractable = true;
    return true;
  }
  protected abstract touchCanelExecute();

  //结束
  onTouchEnd(event?: EventTouch): boolean {
    if (this.isInteractable) {
      return false;
    }
    this.touchEndExecute();
    this.isInteractable = true;
    return true;
  }
  protected abstract touchEndExecute();

  //移动
  onTouchMove(event: EventTouch): boolean {
    if (this.isInteractable) {
      return false;
    }
    this.updateMove(event);
    this.touchMoveExecute();
    return true;
  }
  //实时更新
  private updateMove(event: EventTouch) {
    let touchPos = event.getUILocation();
    this.currentTouchPos = VecTools.convertToLocal(
      VecTools.convertTo3D(touchPos),
      this.node.parent
    );

    let dir: Vec2 = event.getUIDelta();
    this.lastMove[0] = Vec3.distance(Vec3.ZERO, VecTools.convertTo3D(dir));
    this.lastMove[1] = VecTools.convertToAngle(dir);
  }
  protected abstract touchMoveExecute();

  //同步
  private synchroPos() {
    this.lastTouchPos = this.currentTouchPos;
  }

  //拖拽跟随
  protected follow() {
    this.node.setPosition(this.currentTouchPos.x, this.currentTouchPos.y);
    this.synchroPos();
  }
  //移动距离检测
  protected isMoveDis(threshold: number): boolean {
    return Vec3.distance(this.lastTouchPos, this.currentTouchPos) > threshold;
  }
  //移动速度检测
  protected isMoveSpeed(threshold: number): boolean {
    return this.lastMove[0] > threshold;
  }

  protected debug(name: string) {
    if (this.node.name == name) {
      Debug.warn("debug");
    }
  }

  protected onEnable(): void {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }
  protected onDisable(): void {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }
}
