import { _decorator, Component, Node } from "cc";
import Singleton from "../BaseClass/Singleton";

export class ComponentMgr extends Singleton {
  static get ins() {
    return super.GetInstance<ComponentMgr>();
  }

  //注册组件引用至单例管理中心
  register(obj: object, identifier: string) {
    // 尝试将组件的引用设置到的相应字段
    this[identifier] = obj;
  }
}
