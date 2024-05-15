import { Component, _decorator } from "cc";
import State from "./State";
import { Debug } from "../Tools";
const { ccclass, property } = _decorator;
/**
 *状态机基类
 *
 * @export
 * @abstract
 * @class StateMachine
 * @extends {Component}
 */

@ccclass("StateMachine")
export default abstract class StateMachine extends Component {
  //参数Map（动态）
  protected paramsMap: Map<string, boolean | number> = new Map();
  //状态Map（静态）
  protected statesMap: Map<string, State> = new Map();
  //当前状态
  @property
  currentState: string = "";

  //历史状态
  private _stateHistory: string[] = [];

  constructor() {
    super();
  }

  //在构造子类函数里调用
  protected init() {
    this.initParamsMap();
    this.initStatesMap();
  }
  //注册参数
  protected abstract initParamsMap(): void;
  //注册状态
  protected abstract initStatesMap(): void;
  //注册动画事件
  //abstract initAnimationEvent();
  //初始化状态机
  /*  abstract init(): void; */

  //切换状态
  //提供给run使用
  protected stateChange(newState: string): void {
    if (!newState) {
      Debug.log("状态为空");
      return;
    }
    this.statesMap.get(this.currentState)?.exit();
    this._stateHistory.push(this.currentState);
    this.currentState = newState;
    this.statesMap.get(this.currentState)?.entry();
  }
  //状态机运行:判断从什么状态可以到什么状态
  //提供给setParams用
  protected abstract run(): void;
  //重置Trigger
  //提供给setParams用
  private _resetTrigger(): void {
    for (let [key, value] of this.paramsMap) {
      if (value === true) {
        this.paramsMap.set(key, false);
      }
    }
  }

  //改变参数 => 状态机运行 => 重置Trigger
  //状态切换外部入口
  setParams(stateName: string, newParamValue: number | boolean): void {
    if (this.paramsMap.has(stateName)) {
      //改变参数
      this.paramsMap.set(stateName, newParamValue);
      //状态机运行
      this.run();
      //重置Trigger
      this._resetTrigger();
    } else {
      Debug.warn("没有参数" + stateName);
    }
  }

  //获取上个状态
  protected getLastState(): string | null {
    if (this._stateHistory.length > 0) {
      return this._stateHistory.pop() as string;
    } else {
      return null;
    }
  }

  //回到上个状态
  protected backToLastState(): void {
    this.setParams(this.getLastState(), true);
  }
}
