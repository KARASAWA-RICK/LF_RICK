import { _decorator, Component, Node, Vec3 } from "cc";
import { ViewMgr } from "../Manager/ViewMgr";
const { ccclass, property } = _decorator;

@ccclass("Suspend")
export class Suspend extends Component {
  lastParent: Node = null;
  lastWorldPos: Vec3 = null;

  //进入悬浮状态
  execute(layer: number) {
    this.lastParent = this.node.parent;
    this.lastWorldPos = this.node.getWorldPosition();
    ViewMgr.ins.changeLayer(this.node, layer);
    this.node.setWorldPosition(this.lastWorldPos);
  }

  //归位到原位
  reset() {
    this.lastParent && this.node.setParent(this.lastParent);
    this.lastWorldPos && this.node.setWorldPosition(this.lastWorldPos);
  }
}
