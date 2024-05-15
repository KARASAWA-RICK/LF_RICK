import { _decorator, Component, Node, sys } from "cc";
import Singleton from "../BaseClass/Singleton";
import { Debug } from "../Tools";
import { VAL_TYPE_ENUM as SAVE_TYPE_ENUM } from "./SaveMgr";
import { ISetting, SettingMgr } from "./SettingMgr";

const { ccclass, property } = _decorator;
//本地存储数据键
export enum SAVE_KEY_ENUM {
  PLAYERSAVE = "PLAYERSAVE",
}
//本地存储数据类型
export enum VAL_TYPE_ENUM {
  STR = "STR",
  NUM = "NUM",
  OBJ = "OBJ",
}
//玩家存档格式
export interface IPlayerSave {
  setting: ISetting;
}

/**
 *
 *存档管理单例类
 * @export
 * @class SaveMgr
 * @extends {Singleton}
 */
@ccclass("SaveMgr")
export class SaveMgr extends Singleton {
  static get ins() {
    return super.GetInstance<SaveMgr>();
  }
  //数据本地存储
  //传入键名key，对应值val
  private save(key: SAVE_KEY_ENUM, val: any) {
    if (typeof val === "object") {
      val = JSON.stringify(val);
    } else {
      val = val.toString();
    }
    sys.localStorage.setItem(key, val);
  }
  //清空指定数据
  private clear(key: SAVE_KEY_ENUM) {
    this.save(key, null);
  }
  //读取本地数据
  //传入键名，数据类型
  //读取本地存储key对应的值，并根据传入的type将其转化为各种类型
  private load(key: string, type: SAVE_TYPE_ENUM): any {
    let res: any = sys.localStorage.getItem(key);
    if (res) {
      switch (type) {
        case SAVE_TYPE_ENUM.NUM:
          return Number(res);
        case SAVE_TYPE_ENUM.STR:
          return res.toString();
        case SAVE_TYPE_ENUM.OBJ:
          return JSON.parse(res);
      }
    } else {
      Debug.warn("无指定的数据存储");
      return null;
    }
  }

  //存档
  //此处的默认值适用于loadPlaySave之前
  playerSave: IPlayerSave = {
    setting: SettingMgr.ins.defaultSetting,
  };

  //本地保存存档
  saveToLocal() {
    this.save(SAVE_KEY_ENUM.PLAYERSAVE, this.playerSave);
  }

  //读取玩家本地存档
  loadPlayerSave(isReset: boolean) {
    //重置存档
    if (isReset) {
      this.clear(SAVE_KEY_ENUM.PLAYERSAVE);
    }

    let playerSave = this.load(SAVE_KEY_ENUM.PLAYERSAVE, SAVE_TYPE_ENUM.OBJ);
    if (playerSave) {
      Debug.log("有存档，读取存档");
      this.playerSave = playerSave;
    } else {
      Debug.log("没有存档，创建默认存档");
      this.genDefault();
    }
    Debug.log("当前存档数据：\n");
    Debug.log(this.playerSave);
  }

  //创建默认存档
  private genDefault() {
    //重置设置
    SettingMgr.ins.reset();
    this.saveToLocal();
  }
}
