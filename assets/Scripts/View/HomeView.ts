import { _decorator } from "cc";
import BaseView from "./BaseView";
import { DebugTools } from "../Tools/Tools";
import { EVENT_ENUM } from "../Enum/Enum";
const { ccclass } = _decorator;

@ccclass("HomeView")
export class HomeView extends BaseView {
  //按键回调
  async callBackBtn(event: Event, eventName: string) {
    DebugTools.log("按键回调");
    switch (eventName) {
      case EVENT_ENUM.RANK:
        break;
    }
  }
}
