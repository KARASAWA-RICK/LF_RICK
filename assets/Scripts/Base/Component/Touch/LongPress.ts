import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("LongPress")
export class LongPress extends Component {
  private _currentInterval: number;
  private _acceleration: number;
  private _minInterval: number;
  hasExecuted: boolean = false;

  execute(pressTime: number, cb: Function, ...args: any[]) {
    this.scheduleOnce(() => {
      if (args.length > 0) {
        cb(...args);
      } else {
        cb(); // 不传递参数
      }
      this.hasExecuted = true;
    }, pressTime);
  }

  //加速长按：初始间隔 加速度 最小间隔 回调 参数
  executeAccelerated(
    initialInterval: number,
    acceleration: number,
    minInterval: number,
    cb: Function,
    ...args: any[]
  ) {
    this._currentInterval = initialInterval;
    this._acceleration = acceleration;
    this._minInterval = minInterval;
    this._accelerateCallback(cb, ...args);
  }

  private _accelerateCallback(cb: Function, ...args: any[]) {
    this.scheduleOnce(() => {
      if (args.length > 0) {
        cb(...args);
      } else {
        cb(); // 不传递参数
      }
      this.hasExecuted = true;
      this._accelerateCallback(cb, ...args);
    }, this._currentInterval);
    this._currentInterval = Math.max(
      this._currentInterval - this._acceleration,
      this._minInterval
    );
  }

  reset() {
    this.unscheduleAllCallbacks();
    this.hasExecuted = false;
  }
}
