import {
  _decorator,
  AudioClip,
  Component,
  JsonAsset,
  Node,
  Prefab,
  sp,
  SpriteAtlas,
} from "cc";
import { IRes, IView } from "./Index";

const { ccclass } = _decorator;

//资源类型
export const AssetType: Record<string, IRes> = {
  Prefab: { type: Prefab, path: "Prefabs/" },
  Sound: { type: AudioClip, path: "Clips/" },
  Atlas: { type: SpriteAtlas, path: "Atlas/" },
  Spine: { type: sp.SkeletonData, path: "Spines/" },
  Json: { type: JsonAsset, path: "Jsons/" },
};

//UI预制体
export const View: Record<string, IView> = {
  GameView: { name: "GameView", layer: 1, clear: false },
  HomeView: { name: "HomeView", layer: 2, clear: false },
  RankView: { name: "RankView", layer: 3, clear: false },
  ResultView: { name: "ResultView", layer: 4, clear: false },
  PauseView: { name: "PauseView", layer: 5, clear: false },
  SettingView: { name: "SettingView", layer: 6, clear: false },
  AdView: { name: "AdView", layer: 7, clear: false },
  TipView: { name: "TipView", layer: 8, clear: true },
};

@ccclass("Global")
export class Global extends Component {
  //音乐开关
  static isMusic: boolean = true;
  //音效开关
  static isEffect: boolean = true;

  //全局加载历史信息
  static strLoadInfo: string = "";

  //调试日志全局开关
  static Debug: boolean = true;

  //FILLED类型的Sprite组件的填充比例
  static LoadingRate: number = 0;

  //层级节点数组
  static layer: Node[] = [];
}
