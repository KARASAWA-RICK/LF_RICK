import { _decorator, Component, Node } from "cc";
import PoolMgr from "../Manager/PoolMgr";
import { PROP_ENUM } from "../Enum/Enum";
const { ccclass, property } = _decorator;

@ccclass("BaseView")
export default class BaseView extends Component {
  //配置View属性面板

  //是否开启缓动
  @property({
    displayOrder: 0,
    group: PROP_ENUM.VIEW,
  })
  tweenView = true;

  //缓动效果的根节点
  @property({
    type: Node,
    visible() {
      return this.tweenView;
    },
    displayOrder: 0,
    group: PROP_ENUM.VIEW,
  })
  root: Node = null;

  //缓动效果的时间
  @property({
    visible() {
      return this.tweenView;
    },
    displayOrder: 0,
    group: PROP_ENUM.VIEW,
  })
  tweenTime = 0.25;

  //是否播放按钮音效
  @property({
    displayOrder: 0,
    group: PROP_ENUM.VIEW,
  })
  playBtnClip = true;

  //关闭界面
  close() {
    PoolMgr.ins.putNode(this.node);
  }
}
