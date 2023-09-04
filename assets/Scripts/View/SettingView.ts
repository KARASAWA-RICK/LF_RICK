import { _decorator } from "cc";
import BaseView from "./BaseView";
import { DebugTools } from "../Tools/Tools";
import { EVENT_ENUM } from "../Enum/Enum";
const { ccclass } = _decorator;

@ccclass("SettingView")
export class SettingView extends BaseView {
  //按键回调
  async callBackBtn(event: Event, eventName: string) {
    DebugTools.log("按键回调");
    switch (eventName) {
      case EVENT_ENUM.RESUME:
        this.close();
        break;
      case EVENT_ENUM.INIT:
        this.close();
        break;
    }
  }
}
