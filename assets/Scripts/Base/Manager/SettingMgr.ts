import { _decorator, Component, Node } from "cc";
import Singleton from "../BaseClass/Singleton";
import { LANG_ENUM, LangMgr } from "./LangMgr";
import { SaveMgr } from "./SaveMgr";
import AudioMgr from "./AudioMgr";
const { ccclass, property } = _decorator;
export interface ISetting {
  //音乐开关
  isMusic: boolean;
  //音效开关
  isEffect: boolean;
  //语言
  lang: LANG_ENUM;
}
@ccclass("SettingMgr")
export class SettingMgr extends Singleton {
  static get ins() {
    return super.GetInstance<SettingMgr>();
  }
  //当前设置
  get setting(): ISetting {
    return SaveMgr.ins.playerSave.setting;
  }
  set setting(v: ISetting) {
    SaveMgr.ins.playerSave.setting = v;
    SaveMgr.ins.saveToLocal();
  }

  //默认设置
  get defaultSetting(): ISetting {
    return {
      isMusic: true,
      isEffect: true,
      lang: LangMgr.ins.sysLang,
    };
  }
  //重置设置
  reset() {
    this.setting = this.defaultSetting;
  }

  //音乐
  get isMusic(): boolean {
    return this.setting.isMusic;
  }
  set isMusic(v: boolean) {
    this.setting.isMusic = AudioMgr.ins.isMusic = v;
    SaveMgr.ins.saveToLocal();
  }

  //音效
  get isEffect(): boolean {
    return this.setting.isEffect;
  }
  set isEffect(v: boolean) {
    this.setting.isEffect = AudioMgr.ins.isEffect = v;
    SaveMgr.ins.saveToLocal();
  }

  //语言
  get lang(): LANG_ENUM {
    return this.setting.lang;
  }
  set lang(v: LANG_ENUM) {
    this.setting.lang = LangMgr.ins.lang = v;
    SaveMgr.ins.saveToLocal();
  }
}
