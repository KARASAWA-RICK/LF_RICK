import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("DoubleClick")
export class DoubleClick extends Component {
  private _clickCount: number = 0;
  private _lastClickTime: number = 0;

  //双击
  execute(interval: number, cb: Function, ...args: any[]) {
    let currentTime = new Date().getTime();
    if (currentTime - this._lastClickTime < interval) {
      this._clickCount++;
      if (this._clickCount === 2) {
        if (args.length > 0) {
          cb(...args);
        } else {
          cb(); // 不传递参数
        }
        this._clickCount = 0;
      }
    } else {
      this._clickCount = 1;
    }
    this._lastClickTime = currentTime;
  }
}
