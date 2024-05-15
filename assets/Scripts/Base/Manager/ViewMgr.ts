import {
  _decorator,
  Canvas,
  Component,
  director,
  instantiate,
  Layers,
  Node,
  UITransform,
  v3,
  view,
  Widget,
} from "cc";
import Singleton from "../BaseClass/Singleton";
import { AryTools, Debug } from "../Tools";
import PoolMgr from "./PoolMgr";
import BaseView from "../Component/BaseView";
import { Suspend } from "../Component/Suspend";
import { ResMgr } from "./ResMgr";
const { ccclass, property } = _decorator;

//界面格式
export interface IView {
  //预制体名
  name: string;
  //层级数
  layer: number;
  //是否常驻
  isPersistent: boolean;
  //界面类型
  type: VIEW_TYPE_ENUM;
}
//界面类型
export enum VIEW_TYPE_ENUM {
  //唯一模式
  ONLY = "ONLY",
  //遮盖模式
  COVER = "COVER",
  //顶替模式
  REPLACE = "REPLACE",
}

//界面列表
export const ViewList: Record<string, IView> = {};

/**
 *
 *界面管理单例类
 * @export
 * @class ViewMgr
 * @extends {Singleton}
 */
@ccclass("ViewMgr")
export class ViewMgr extends Singleton {
  static get ins() {
    return super.GetInstance<ViewMgr>();
  }

  //层级节点数组
  layers: Node[] = [];
  //激活的所有界面
  views: Node[] = [];

  //创建1个覆盖全屏的显示层级空节点
  private createLayer(): Node {
    // 获取可见区域的大小
    const size = view.getVisibleSize();
    // 创建节点
    const node = new Node();
    // 设置节点层级为UI_2D
    node.layer = Layers.Enum.UI_2D;
    // 添加UITransform组件，并设置内容大小为可见区域的大小
    const transfrom = node.addComponent(UITransform);
    transfrom.setContentSize(size);
    // 添加Widget组件，并设置对齐方式和边距
    const widget = node.addComponent(Widget);
    widget.isAlignLeft =
      widget.isAlignTop =
      widget.isAlignTop =
      widget.isAlignBottom =
        true;
    widget.right = widget.left = widget.top = widget.bottom = 0;

    return node;
  }

  //生成layer+1个覆盖全屏的空节点，用于界面分层，编号0 ~ layer
  initLayers(layer: number) {
    const scene = director.getScene();
    for (let i = 0; i <= layer; i++) {
      this.layers[i] = this.layers[i]
        ? instantiate(this.layers[i])
        : this.createLayer();
      this.layers[i].name = "Layer" + i;
      this.layers[i].parent = scene.getComponentInChildren(Canvas).node;
    }
  }

  //清空指定Layer（无动画）
  clearLayer(layer: number, except?: Node) {
    const children = this.layers[layer].children;
    if (!this.layers[layer]) {
      return;
    }
    for (const child of children) {
      if (child == except) {
        continue;
      }
      PoolMgr.ins.putNode(child);
    }
  }
  //清空所有Layer（无动画）
  clearAllLayers(includePersistent = false) {
    for (const layer of this.layers) {
      const children = layer.children;
      for (const child of children) {
        if (!includePersistent && ViewList[child.name]?.isPersistent) {
          continue;
        }
        PoolMgr.ins.putNode(child);
      }
    }
  }
  //生成指定界面
  async genView(view: IView, param?: any, parent?: Node) {
    parent = parent ? parent : this.layers[view.layer];
    switch (view.type) {
      //唯一模式，且已经有同名界面了，直接退出
      case VIEW_TYPE_ENUM.ONLY:
        for (const child of parent.children) {
          if (child.name == view.name) {
            return;
          }
        }
      //替代模式，且已经有同名界面了，顶替
      case VIEW_TYPE_ENUM.REPLACE:
        for (const child of parent.children) {
          if (child.name == view.name) {
            PoolMgr.ins.putNode(child);
          }
        }
        break;
      //重叠模式，正常生成
      case VIEW_TYPE_ENUM.COVER:
        break;
      default:
        break;
    }
    const node = await ResMgr.ins.getPrefab(view, parent);
    node.active = true;
    (node.getComponent(view.name) as BaseView).init(param);
    AryTools.addToAry(node, this.views);
  }
  //关闭指定界面
  closeView(node: Node) {
    if (!(node.getComponent(node.name) as BaseView)) {
      return;
    }
    PoolMgr.ins.putNode(node);
    AryTools.removeFstFromAry(node, this.views);
  }
  //获取指定界面节
  getView(view: IView, parent?: Node): Node | null {
    parent = parent ? parent : this.layers[view.layer];
    for (const child of parent.children) {
      if (child.name == view.name) {
        return child;
      }
    }
    Debug.warn("无" + view.name + "界面");
    return null;
  }

  //转移层级
  changeLayer(node: Node, layer: number) {
    node.setParent(this.layers[layer]);
  }

  //附属界面
  showSubView(node: Node, layer: number) {
    if (!node.getComponent(Suspend) || !node) {
      return;
    }
    // 显示 + 悬浮
    node.active = true;
    node.getComponent(Suspend).execute(layer);
    // 居中
    const screenSize = view.getVisibleSize();
    const screenCenter = v3(screenSize.width / 2, screenSize.height / 2, 0);
    node.setWorldPosition(screenCenter);

    // 撑满
    const uiTransform = node.getComponent(UITransform);
    if (uiTransform) {
      uiTransform.width = screenSize.width;
      uiTransform.height = screenSize.height;
    }
  }
  closeSubView(node: Node) {
    if (!node.getComponent(Suspend) || !node) {
      return;
    }
    node.active = false;
    node.getComponent(Suspend).reset();
  }

  //隐藏层级
  hideLayer(view: IView) {
    this.layers[view.layer].active = false;
  }
  //恢复层级
  showLayer(view: IView) {
    this.layers[view.layer].active = true;
  }
  showAllLayers() {
    for (const layer of this.layers) {
      layer.active = true;
    }
  }
}
