import { _decorator, Component, Node } from "cc";
import { AnimaTools } from "../Tools";
import { ViewMgr } from "../Manager/ViewMgr";
const { ccclass, property } = _decorator;

export default abstract class BaseView extends Component {
  //是否缓动
  @property
  isTween: boolean = false;
  //缓动根节点
  @property({
    type: Node,
    visible() {
      return this.isTween;
    },
  })
  fadeInRoot: Node = null;
  //缓动时间
  fadeInDur: number = 0.225;

  //缓动进入
  private fadeIn() {
    if (!this.isTween) {
      return;
    }
    if (!this.fadeInRoot) {
      this.fadeInRoot = this.node;
    }
    AnimaTools.fadeIn(this.fadeInRoot, this.fadeInDur, "backOut");
  }

  //关闭
  protected close() {
    ViewMgr.ins.closeView(this.node);
  }

  //初始化
  abstract init(param?: any);

  protected onEnable(): void {
    this.fadeIn();
  }
}
