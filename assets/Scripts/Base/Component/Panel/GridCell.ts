import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

//用于GridPanel的Cell
@ccclass("GridCell")
export abstract class GridCell extends Component {
  @property
  x: number = 0;
  @property
  y: number = 0;

  init(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.clear();
  }

  protected abstract clear();
}
