import { _decorator, Component, Font, Node, sys } from "cc";
import Singleton from "../BaseClass/Singleton";
import { ResMgr } from "./ResMgr";
import DHLabel from "../Component/DHLabel";
import { AryTools, Debug } from "../Tools";
import ConfigMgr from "./ConfigMgr";

const { ccclass, property } = _decorator;
export interface IMultiLang {
  id: number;
  content: string;
}

//语言枚举
export enum LANG_ENUM {
  CN = "Cn", // 简体中文
  CNT = "Cnt", // 繁体中文
  KR = "Kr", // 韩语
  JP = "Jp", // 日语
  EN = "En",
}

//语言映射
const languageMap: Record<string, LANG_ENUM> = {
  "zh-cn": LANG_ENUM.CN, // 简体中文
  "zh-tw": LANG_ENUM.CNT, // 繁体中文
  ko: LANG_ENUM.KR, // 韩语
  ja: LANG_ENUM.JP, // 日语
  en: LANG_ENUM.EN, // 英语，作为默认值
};

const fontMap: Record<LANG_ENUM, string> = {
  [LANG_ENUM.CN]: "ResourceHanRoundedCN-Bold", // 简体中文
  [LANG_ENUM.CNT]: "ResourceHanRoundedCN-Bold", // 繁体中文
  [LANG_ENUM.JP]: "ResourceHanRoundedCN-Bold", // 日语
  [LANG_ENUM.KR]: "Jua-Regular", // 韩语
  [LANG_ENUM.EN]: "LilitaOne-Regular", // 英语，作为默认值
};

@ccclass("LangMgr")
export class LangMgr extends Singleton {
  static get ins() {
    return super.GetInstance<LangMgr>();
  }

  //所有文本组件
  private labels: DHLabel[] = [];
  //注册
  register(label: DHLabel) {
    AryTools.addToAry(label, this.labels);
  }
  //移除
  unregister(label: DHLabel) {
    AryTools.removeFstFromAry(label, this.labels);
  }
  //刷新所有组件
  private async refreshAll() {
    for (const label of this.labels) {
      label.refresh();
    }
  }
  private _lang: LANG_ENUM = this.sysLang;
  //不直接使用，修改语言使用settingMgr
  set lang(v: LANG_ENUM) {
    this._lang = v;
    ConfigMgr.ins.handleConfig();
    this.refreshAll();
  }

  //字体
  get font(): Font {
    let str = fontMap[this._lang];
    return ResMgr.ins.getFont(str);
  }

  //系统语言
  get sysLang(): LANG_ENUM {
    //默认语言（英语）
    let str: LANG_ENUM = LANG_ENUM.EN;
    // 获取平台语言代码
    const code = sys.languageCode;
    Debug.warn("语言code: " + code);
    if (languageMap[code]) {
      str = languageMap[code];
    }
    return str;
  }

  //获取多语言表文本
  getText(id: number): string {
    const table = ConfigMgr.ins.getTable<IMultiLang>("MultiLang" + this._lang);
    if (!table) {
      return "No Table";
    }
    if (!table[id]) {
      return "No ID:" + id;
    }
    const str: string = table[id].content;
    if (str == "") {
      return "No Content:" + id;
    } else {
      return str;
    }
  }
}
