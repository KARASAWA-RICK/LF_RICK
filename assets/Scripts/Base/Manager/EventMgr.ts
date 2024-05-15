import { _decorator } from "cc";
import Singleton from "../BaseClass/Singleton";
const { ccclass } = _decorator;

/**
 *
 *事件管理单例类
 * @export
 * @class EventMgr
 * @extends {Singleton}
 */
@ccclass("EventMgr")
export default class EventMgr extends Singleton {
  static get ins() {
    return super.GetInstance<EventMgr>();
  }

  private _handlers: { [key: string]: any[] } = {};

  /**
   * 监听事件
   * @param {string} eventName 事件名称
   * @param {function} handler 监听函数
   * @param {object} target 监听目标
   */
  on(eventName: string, handler: Function, target: any) {
    var objHandler: {} = { handler: handler, target: target };
    //注册事件
    var handlerList: any[] = this._handlers[eventName];
    if (!handlerList) {
      handlerList = [];
      this._handlers[eventName] = handlerList;
    }

    //为事件注册回调数组
    for (var i = 0; i < handlerList.length; i++) {
      if (!handlerList[i]) {
        handlerList[i] = objHandler;
        return i;
      }
    }

    handlerList.push(objHandler);

    return handlerList.length;
  }

  /**
   * 取消监听
   * @param {string} eventName 监听事件
   * @param {function} handler 监听函数
   * @param {object} target 监听目标
   */
  off(eventName: string, handler: Function, target: any) {
    var handlerList = this._handlers[eventName];

    if (!handlerList) {
      return;
    }

    for (var i = 0; i < handlerList.length; i++) {
      var oldObj = handlerList[i];
      if (oldObj.handler === handler && (!target || target === oldObj.target)) {
        handlerList.splice(i, 1);
        break;
      }
    }
  }

  /**
   * 分发事件
   * @param {string} eventName 分发事件名
   * @param  {...any} params 分发事件参数
   */
  emit(eventName: string, ...args: any) {
    var handlerList = this._handlers[eventName];

    var args1 = [];
    var i;
    //Debug.log(arguments);
    for (i = 1; i < arguments.length; i++) {
      args1.push(arguments[i]);
    }

    if (!handlerList) {
      return;
    }
    //Debug.log(args1);
    //遍历对应事件的回调数组，传参执行
    for (i = 0; i < handlerList.length; i++) {
      var objHandler = handlerList[i];
      if (objHandler.handler) {
        objHandler.handler.apply(objHandler.target, args1);
      }
    }
  }
}
