import { _decorator, Component, find, Node } from "cc";
import Singleton from "./Base/BaseClass/Singleton";
import ConfigMgr from "./Base/Manager/ConfigMgr";
import PoolMgr from "./Base/Manager/PoolMgr";
import MapCtrl from "./MapCtrl";
const { ccclass, property } = _decorator;

@ccclass("MapMgr")
export class MapMgr extends Singleton {
  static get ins() {
    return super.GetInstance<MapMgr>();
  }

  //生成地图
  genMap(
    chapter: number,
    level: number,
    isShowGrid: boolean,
    tileWidth: number,
    tileHeight: number
  ): Node {
    const map = PoolMgr.ins.getNode("Map", find("Canvas"));
    map
      .getComponent(MapCtrl)
      .init(chapter, level, isShowGrid, tileWidth, tileHeight);
    return map;
  }
  //获取地图初始配置
  getMapConfig(chapter: number, level: number): IMap {
    const table: Record<number, IGrid> = ConfigMgr.ins.getTable<IGrid>(
      chapter + "-" + level
    );
    //计算网格的宽度和高度
    let w = 0;
    let h = 0;
    for (const id in table) {
      const gridInfo: IGrid = table[id];
      const x = gridInfo.x;
      const y = gridInfo.y;
      if (x >= w) w = x + 1;
      if (y >= h) h = y + 1;
    }
    //初始化网格
    let grids: IGrid[][] = Array.from({ length: h }, () =>
      Array.from({ length: w }, () => null)
    );
    //填充网格
    for (const id in table) {
      const gridInfo: IGrid = table[id];
      const x = gridInfo.x;
      const y = gridInfo.y;
      grids[y][x] = gridInfo;
    }
    return { w, h, grids };
  }
}

export interface IMap {
  w: number;
  h: number;
  grids: IGrid[][];
}
export interface IGrid {
  id: number;
  x: number;
  y: number;
  walkable: boolean;
  g?: number; // 从起点到当前节点的成本
  h?: number; // 从当前节点到终点的启发式估计成本
  f?: number; // 总成本，f = g + h
  parent?; // 父节点
}
