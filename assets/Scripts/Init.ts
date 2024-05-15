import { _decorator, Component, Node } from "cc";
import { ResMgr, AssetType } from "./Base/Manager/ResMgr";
import { MapMgr } from "./MapMgr";
import MapCtrl from "./MapCtrl";
import { Debug } from "./Base/Tools";
const { ccclass, property } = _decorator;

@ccclass("Init")
export class Init extends Component {
  async start() {
    await this.loadRes();
    this.testAStar();
  }

  async loadRes() {
    await ResMgr.ins.loadBundle(1);
    await ResMgr.ins.loadRes(1, AssetType.SpriteFrame);
    await ResMgr.ins.loadRes(1, AssetType.Json);
    await ResMgr.ins.loadRes(1, AssetType.Prefab);
  }

  testAStar() {
    const map = MapMgr.ins.genMap(1, 1, true, 128, 128);
    const mapCtrl = map.getComponent(MapCtrl);
    const grids = mapCtrl.findPath(0, 0, 5, 1);
    if (grids) {
      for (const grid of grids) {
        Debug.warn({ x: grid.x, y: grid.y });
      }
    } else {
      Debug.warn("No Way!");
    }
  }
}
