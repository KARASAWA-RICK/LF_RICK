import { _decorator, Label } from "cc";
import { LangMgr } from "../Manager/LangMgr";

const { ccclass, property, executeInEditMode, menu } = _decorator;

@ccclass
@executeInEditMode(true)
@menu("DHComponent/UI/DHLabel")
export default class DHLabel extends Label {
  @property({ tooltip: "是否需要根据多语言替换字体" })
  private isChangeFont: boolean = true;
  //根据ID自动获取对应多语言文本
  @property({ tooltip: "多语言配置表文本ID" })
  private mutiLangId: number = 0;
  onLoad(): void {
    super.onLoad();
    LangMgr.ins.register(this);
    this.refresh();
  }

  async refresh() {
    //字体
    if (this.isChangeFont) {
      this.font = LangMgr.ins.font;
    }
    //多语言文本
    if (this.mutiLangId > 0) {
      this.string = LangMgr.ins.getText(this.mutiLangId);
    }
  }

  onDestroy(): void {
    super.onDestroy();
    LangMgr.ins.unregister(this);
  }
}
