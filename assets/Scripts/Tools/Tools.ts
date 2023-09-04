//工具类
import {
  _decorator,
  Sprite,
  SpriteFrame,
  Node,
  tween,
  Layers,
  Vec3,
  UITransform,
  Widget,
  view,
  Vec2,
  v3,
  v2,
  director,
  instantiate,
  Canvas,
  AnimationClip,
  SpriteAtlas,
  animation,
} from "cc";
import ResMgr from "../Manager/ResMgr";
import { Global } from "../Global/Global";

//基本
export class BaseTools {
  //定义xyz都为1的向量
  static ONE = v3(1, 1, 1);
  //定义0向量
  static ZERO = v3(0, 0, 0);

  //获取从1970年1月1日至今的总天数
  static getDay() {
    return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  }

  //是英语环境返回true，否则false
  static isEn(): boolean {
    return navigator.language.indexOf("zh") != -1 ? false : true;
  }

  //创建空节点
  static createNode(parent: Node, name: string = "") {
    const node = new Node(name);
    node.setParent(parent);
    node.layer = Layers.Enum.UI_2D;
    node.addComponent(UITransform);
    return node;
  }

  //创建覆盖全屏的空节点(用于UI)
  static createUI(): Node {
    // 获取可见区域的大小
    const size = view.getVisibleSize();
    // 创建节点
    const node = new Node();
    // 设置节点层级为UI_2D
    node.layer = Layers.Enum.UI_2D;
    // 添加UITransform组件，并设置内容大小为可见区域的大小
    const transfrom = node.addComponent(UITransform);
    transfrom.setContentSize(size);
    // 添加Widget组件，并设置对齐方式和边距
    const widget = node.addComponent(Widget);
    widget.isAlignLeft =
      widget.isAlignTop =
      widget.isAlignTop =
      widget.isAlignBottom =
        true;
    widget.right = widget.left = widget.top = widget.bottom = 0;

    return node;
  }

  //生成layerNumber个空节点用于分层放置UI
  static initUILayerNodes(layerNumber: number) {
    const scene = director.getScene();
    for (let i = 0; i <= layerNumber; i++) {
      Global.layer[i] = Global.layer[i]
        ? instantiate(Global.layer[i])
        : BaseTools.createUI();
      Global.layer[i].name = "Layer" + i;
      Global.layer[i].parent = scene.getComponentInChildren(Canvas).node;
    }
  }
}

//向量
export class VectorTools {
  //三向量转二维
  static convertTo2D(vector3: Vec3): Vec2 {
    // 选择将 z 轴投影到 x 轴上
    const x = vector3.x;
    const y = vector3.y;

    // 创建一个二维向量对象
    const vector2 = v2(x, y);
    //返回二维向量
    return vector2;
  }

  //二维向量转三维
  static convertTo3D(vector2: Vec2): Vec3 {
    const x = vector2.x;
    const y = vector2.y;

    const vector3 = v3(x, y, 0);

    return vector3;
  }

  //计算point1 → point2的距离
  static calculateDistance(point1: Vec2, point2: Vec2): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
  }

  //计算point1 → point2的方向向量
  static calculateDir(point1: Vec2, point2: Vec2): Vec2 {
    let dir = point2.subtract(point1).normalize();
    return dir;
  }

  //角度转弧度
  static convertToRadian(angle: number) {
    const RADIAN = Math.PI / 180;
    let radian = angle * RADIAN;
    return radian;
  }

  //弧度转方向向量
  static convertToDir(radian: number) {
    let dir = v2(Math.cos(radian), Math.sin(radian)).normalize();
    return dir;
  }

  //向量转角度
  static convertToAngle(pos: Vec2 | Vec3) {
    let angle = Math.round((Math.atan2(pos.y, pos.x) * 180) / Math.PI);
    return angle;
  }
}

//动画
export class AnimationTools {
  //创建序列帧动画
  static createAnimationClip(
    atlasName: string,
    duration: number,
    wrapMode: AnimationClip.WrapMode,
    name?: string
  ) {
    //获取序列帧数组
    const spriteAtlas: SpriteAtlas = ResMgr.ins.getAtlas(atlasName);
    const spriteFrames: SpriteFrame[] = spriteAtlas.getSpriteFrames();
    const speed = duration / spriteFrames.length;
    const frames: [number, SpriteFrame][] = spriteFrames.map(
      (item: SpriteFrame, index: number) => [speed * index, item]
    );

    //创建动画
    const animationClip = new AnimationClip();

    //创建属性轨道
    const track = new animation.ObjectTrack();

    //确定轨道路径
    track.path = new animation.TrackPath()
      .toComponent(Sprite)
      .toProperty("spriteFrame");

    //设置序列帧
    track.channel.curve.assignSorted(frames);

    //添加属性轨道
    animationClip.addTrack(track);

    //设置动画周期
    animationClip.duration = duration;

    //设置循环模式
    animationClip.wrapMode = wrapMode;

    //设置名称
    if (name) {
      animationClip.name = name;
    }

    DebugTools.log(atlasName + "动画创建成功");

    return animationClip;
  }

  //节点的淡入效果：
  //传入一个节点，和一个数字用于表示淡入时间
  static fadeIn(node: Node, dura = 0.2, scale = BaseTools.ONE) {
    //将节点尺寸缩小为0
    node.setScale(Vec3.ZERO);
    //在dura时间内逐渐恢复原来尺寸
    tween(node).to(dura, { scale: scale }).start();
  }

  //节点的淡出效果：
  //传入一个节点，和一个淡出结束后的回调函数
  //淡出后，节点不可见，且不参与物理效果，但还在场景中
  static fadeOut(node: Node, cb?) {
    //在0.15秒后将节点尺寸缩小为0
    tween(node)
      .to(0.15, { scale: BaseTools.ZERO }, { easing: "elasticOut" })
      .call(() => {
        cb && cb();
      })
      .start();
  }
}

//数组
export class ArrayTools {
  //依据节点从数组中移除元素：
  //传入一个节点，和一个由含有节点属性的元素构成的数组
  //从数组中移除第一个含有该节点的元素
  static clearFromArrayNode(key, array) {
    const l = array.length;
    for (var i = 0; i < l; i++) {
      if (array[i].node == key) {
        array.splice(i, 1);
        break;
      }
    }
  }

  //从数组中移除元素：
  //传入一个元素，和一个数组
  //从该数组中移除第一个该元素
  static clearFromArray(key, array: [typeof key]) {
    const l = array.length;
    for (var i = 0; i < l; i++) {
      if (array[i] == key) {
        array.splice(i, 1);
        break;
      }
    }
  }
}

//随机
export class RandomTools {
  //传入两个数字min和max
  //生成min和max之间的一个随机数，前闭后开
  static randBetween(min: number, max: number) {
    return min + Math.random() * (max - min);
  }
}

//Debug日志
export class DebugTools {
  static log(...data: any[]) {
    Global.Debug && console.log(data);
  }

  static warn(...data: any[]) {
    Global.Debug && console.warn(data);
  }

  static error(...data: any[]) {
    Global.Debug && console.error(data);
  }
}
