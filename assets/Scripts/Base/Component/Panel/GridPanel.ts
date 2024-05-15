import { _decorator, Component, Layout, Node, UITransform, Widget } from "cc";
import PoolMgr from "../../Manager/PoolMgr";
import { GridCell } from "./GridCell";
import { Panel } from "./Panel";
import { BaseTools, Debug, StrTools } from "../../Tools";
const { ccclass, property } = _decorator;

//网格矩阵面板
@ccclass("GridPanel")
export abstract class GridPanel extends Panel {
  private _size: [number, number] = [0, 0];
  get size(): [number, number] {
    return this._size;
  }
  protected setPanel(
    panelSize: string,
    cellSize: [number, number],
    spacing: [number, number]
  ) {
    //重置

    const size = StrTools.strToAry(panelSize) as number[];
    this._size = [size[0], size[1]];
    //Layout
    const layout = this.getComponent(Layout);
    layout.type = Layout.Type.GRID;
    layout.resizeMode = Layout.ResizeMode.NONE;
    layout.startAxis = Layout.AxisDirection.HORIZONTAL;
    layout.paddingLeft = 0;
    layout.paddingRight = 0;
    layout.paddingTop = 0;
    layout.paddingBottom = 0;
    layout.spacingX = spacing[0];
    layout.spacingY = spacing[1];
    layout.verticalDirection = Layout.VerticalDirection.TOP_TO_BOTTOM;
    layout.horizontalDirection = Layout.HorizontalDirection.LEFT_TO_RIGHT;
    layout.constraint = Layout.Constraint.FIXED_COL;
    layout.constraintNum = size[0];

    //格子数量
    let contentWidth = (cellSize[0] + spacing[0]) * size[0] - spacing[0];
    let contentHeight = (cellSize[1] + spacing[1]) * size[1] - spacing[1];
    this.getComponent(UITransform).contentSize.set(contentWidth, contentHeight);
    this.node.getComponent(Widget)?.updateAlignment();
  }

  //生成cell
  protected genCells(cellName: string) {
    BaseTools.clearNode(this.node);
    for (let i = 0; i < this.size[0] * this.size[1]; i++) {
      let x = i % this.size[0];
      let y = Math.floor(i / this.size[0]);
      let cell: Node = PoolMgr.ins.getNode(cellName, this.node);
      let cellCtrl: GridCell = cell.getComponent(cellName + "Ctrl") as GridCell;
      cellCtrl.init(x, y);
    }
  }

  //xy转化索引
  getCellIndex(x: number, y: number): number | null {
    if (x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1]) {
      return null;
    }
    return y * this.size[0] + x;
  }
}
