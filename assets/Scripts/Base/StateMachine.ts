import { Component, _decorator } from "cc";
import State from "./State";
import { DebugTools } from "../Tools/Tools";
const { ccclass } = _decorator;

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
  paramsMap: Map<string, boolean | number> = new Map();
  //状态Map（静态）
  statesMap: Map<string, State> = new Map();
  //当前状态
  currentState: string;

  //注册参数
  abstract initParamsMap(): void;
  //注册状态
  abstract initStatesMap(): void;
  //注册动画事件
  //abstract initAnimationEvent();
  //初始化状态机
  abstract init(): void;

  //切换状态
  //提供给run使用
  stateChange(newState: string): void {
    DebugTools.log("状态切换至" + newState);
    this.currentState = newState;
    this.statesMap.get(this.currentState).excuteState();
  }
  //状态机运行（判断 + 切换）
  //提供给setParams用
  abstract run(): void;
  //重置Trigger
  //提供给setParams用
  resetTrigger(): void {
    for (let [key, value] of this.paramsMap) {
      if (value === true) {
        this.paramsMap.set(key, false);
      }
    }
  }

  //改变参数 => 状态机运行 => 重置Trigger
  //状态切换外部入口
  setParams(stateName: string, newParamValue: number | boolean): void {
    DebugTools.log("进入状态切换外部入口");
    if (this.paramsMap.has(stateName)) {
      DebugTools.log("有参数" + stateName);
      //改变参数
      this.paramsMap.set(stateName, newParamValue);
      //状态机运行
      this.run();
      //重置Trigger
      this.resetTrigger();
    } else {
      DebugTools.warn("没有参数" + stateName);
    }
  }
}
