import { Animation } from "cc";
import StateMachine from "./StateMachine";
import { Debug } from "../Tools";

/**
 **
 *状态基类
 **
 *一个State实例必定属于某个状态机实例的stateMap对象，所以必须向构造函数传入一个状态机实例作为字段（其他字段/方法按需添加）
 * @export
 * @class State
 */
export default class State {
  /**
   * Creates an instance of State.
   * @param {StateMachine} fsm
   * @param {Function} entryCb
   * @param {string} [animationClipName]
   * @param {number} [duration]
   * @memberof State
   */
  constructor(
    private fsm: StateMachine,
    private entryCb: Function,
    private exitCb: Function,
    private animationClipName?: string,
    private duration?: number
  ) {}

  //进入状态
  entry() {
    //动画处理
    this.executeAnimation();
    //其他逻辑处理
    this.entryCb && this.entryCb();
  }

  //退出状态
  exit() {
    this.exitCb && this.exitCb();
  }

  //动画处理：若有animationClip，则播放
  executeAnimation() {
    if (this.animationClipName) {
      Debug.log("播放" + this.animationClipName + "动画");
      //若有duration，则crossFade
      if (this.duration) {
        this.fsm.node
          .getComponent(Animation)
          .crossFade(this.animationClipName, this.duration);
      }
      //若无duration，则play
      else {
        this.fsm.node.getComponent(Animation).play(this.animationClipName);
      }
    }
  }
}
