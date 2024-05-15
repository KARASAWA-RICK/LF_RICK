//工具类
import {
  _decorator,
  Node,
  tween,
  Vec3,
  UITransform,
  Vec2,
  v3,
  v2,
  AnimationClip,
  SpriteAtlas,
  SpriteFrame,
  animation,
  Sprite,
  Component,
  Size,
  TweenEasing,
} from "cc";
import { ResMgr } from "./Manager/ResMgr";
import PoolMgr from "./Manager/PoolMgr";
export class AlgorithmTools {
  //曼哈顿距离
  static manhattan(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1- y2);
  }
}
//基本
export class BaseTools {
  //清理节点
  static clearNode(node: Node, target?: string) {
    if (!target) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        PoolMgr.ins.putNode(node.children[i]);
      }
    } else {
      for (let i = node.children.length - 1; i >= 0; i--) {
        if (node.children[i].name == target) {
          PoolMgr.ins.putNode(node.children[i]);
        }
      }
    }
  }

  //深拷贝
  static deepCopy(target: any): any {
    if (target === null || typeof target !== "object") {
      return target;
    }

    // 处理日期
    if (target instanceof Date) {
      return new Date(target.getTime());
    }

    // 处理数组
    if (Array.isArray(target)) {
      return target.map((item) => this.deepCopy(item));
    }

    // 处理对象
    const copiedObj: Record<string, any> = {};
    Object.keys(target).forEach((key) => {
      copiedObj[key] = this.deepCopy(target[key]);
    });

    return copiedObj;
    return target;
  }
}

export class TimeTools {
  //获取获取从1970年1月1日至今的总秒数
  static getSec() {
    return Math.floor(Date.now() / 1000);
  }
  //获取从1970年1月1日至今的总天数
  static getDay() {
    return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  }
  //获取从现在到今天24点的秒数
  static todayLeft(): number {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );
    const seconds = (nextMidnight.getTime() - now.getTime()) / 1000;
    return Math.floor(seconds);
  }
  static formatTime(seconds: number, includeHours: boolean = false): string {
    if (includeHours) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }
  }

  static getNowTime() {
    let time = new Date();
    return time.getTime() / 1000;
  }

  static getNowTimeMs() {
    let time = new Date();
    return time.getTime();
  }
}
export class NumTools {
  //计算组合数
  static combination(n: number, k: number): number {
    // 定义计算阶乘的内部函数
    function factorial(x: number): number {
      if (x === 0 || x === 1) {
        return 1;
      }
      return x * factorial(x - 1);
    }

    // 使用组合公式计算组合数
    return factorial(n) / (factorial(k) * factorial(n - k));
  }

  //小数转分数，分子保留fix位小数，
  static toFraction(n: number, denominator: number, fix: number = 0): string {
    const scaled = n * denominator;
    const rounded = scaled.toFixed(fix); // 保留fix位小数
    return `${rounded}/${denominator}`;
  }

  //检查奇偶
  static isOdd(n: number): boolean {
    if (n % 2 !== 0) {
      return true;
    }
    return false;
  }

  //小数转百分比
  static toPercentage(value: number, decimalPlaces: number = 2): string {
    return `${(value * 100).toFixed(decimalPlaces)}%`;
  }
}

//向量、坐标
export class VecTools {
  //三向量转二维
  static convertTo2D(vec3D: Vec3): Vec2 {
    return v2(vec3D.x, vec3D.y);
  }

  //二维向量转三维
  static convertTo3D(vec2D: Vec2): Vec3 {
    return v3(vec2D.x, vec2D.y, 0);
  }

  //世界坐标转局部坐标
  static convertToLocal(worldPos: Vec3, parentNode: Node): Vec3 {
    let uiTransform = parentNode.getComponent(UITransform);
    let localPos = uiTransform.convertToNodeSpaceAR(worldPos);
    return localPos;
  }

  //rangeNode是否包含localPos（相对rangeNode父节点的局部坐标）
  static checkPosIn(localPos: Vec3, rangeNode: Node): boolean {
    if (!rangeNode) {
      return false;
    }
    let bbox = rangeNode.getComponent(UITransform).getBoundingBox();
    return bbox.contains(VecTools.convertTo2D(localPos));
  }
  //rangeNode是否包含pointNode
  static checkNodeIn(pointNode: Node, rangeNode: Node): boolean {
    if (!pointNode || !rangeNode || !pointNode.active || !rangeNode.active) {
      return false;
    }
    let worldPos = pointNode.getWorldPosition();
    let localPos = VecTools.convertToLocal(worldPos, rangeNode.parent);
    let bbox = rangeNode.getComponent(UITransform).getBoundingBox();
    return bbox.contains(VecTools.convertTo2D(localPos));
  }

  //TODO只改变父节点，不改变世界坐标
  static changeParentButPos() {}

  //计算point1 → point2的向量
  static calculateVec(point1: Vec3, point2: Vec3): Vec3 {
    return point2.subtract(point1);
  }

  //计算point1 → point2的方向向量
  static calculateDir(point1: Vec3, point2: Vec3): Vec3 {
    return point2.subtract(point1).normalize();
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
export class AnimaTools {
  //创建序列帧动画
  static createAnimationClip(
    atlasName: string,
    duration: number,
    wrapMode: AnimationClip.WrapMode,
    name?: string
  ): AnimationClip {
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

    Debug.log(atlasName + "动画创建成功");

    return animationClip;
  }

  //节点的淡入效果
  static fadeIn(
    node: Node,
    dura: number,
    easing?: TweenEasing | ((k: number) => number),
    cb?: Function
  ) {
    //将节点尺寸缩小为0
    node.setScale(Vec3.ZERO);
    //在dura时间内逐渐恢复原来尺寸
    tween(node)
      .to(dura, { scale: Vec3.ONE }, { easing: easing ? easing : "linear" })
      .call(() => {
        cb && cb();
      })
      .start();
  }

  //节点的淡出效果
  static fadeOut(node: Node, dura: number, cb?: Function) {
    //在0.15秒后将节点尺寸缩小为0
    tween(node)
      .to(dura, { scale: Vec3.ZERO })
      .call(() => {
        cb && cb();
      })
      .start();
  }

  //节点放大后复原效果
  static pulse(node: Node, dura: number, scale: Vec3, cb?: Function) {
    tween(node)
      .to(dura, { scale: scale })
      .to(dura, { scale: Vec3.ONE })
      .call(() => {
        cb && cb();
      })
      .start();
  }

  //节点缩放效果
  static changeSize(node: Node, dura: number, scale: Vec3, cb?: Function) {
    tween(node)
      .to(dura, { scale: scale })
      .call(() => {
        cb && cb();
      })
      .start();
  }
  //节点移动到指定位置（局部坐标）
  static moveTo(node: Node, pos: Vec3, dura: number, cb?: Function) {
    tween(node)
      .to(dura, { position: pos })
      .call(() => {
        cb && cb();
      }) // 在指定的时间内移动到目标位置
      .start(); // 开始执行Tween动画}
  }

  //节点移动指定向量
  static moveBy(node: Node, vec: Vec3, dura: number, cb?: Function) {
    tween(node)
      .by(dura, { position: vec })
      .call(() => {
        cb && cb();
      }) // 在指定的时间内移动到目标位置
      .start(); // 开始执行Tween动画}
  }
}

//数组
export class AryTools {
  static removeDuplicates(ary: any[]): any[] {
    const uniqueArray = [];
    const jsonObjectSet = new Set();

    for (const item of ary) {
      // 对于复杂数据类型（如对象），我们将它们转换为JSON字符串进行比较
      if (typeof item === "object" && item !== null) {
        const jsonItem = JSON.stringify(item);
        if (!jsonObjectSet.has(jsonItem)) {
          jsonObjectSet.add(jsonItem);
          uniqueArray.push(item);
        }
      } else {
        // 简单数据类型直接使用 Set 来保证唯一性
        if (!uniqueArray.includes(item)) {
          uniqueArray.push(item);
        }
      }
    }

    return uniqueArray;
  }

  static strAryToNumAry(strAry: string[]): number[] {
    return strAry.map((item) => {
      const number = parseFloat(item);
      if (isNaN(number)) {
        throw new Error(`Cannot convert "${item}" to a number.`);
      }
      return number;
    });
  }
  static numAryToStrAry(numAry: number[]): string[] {
    return numAry.map((item) => item.toString());
  }
  //依据节点从数组中移除元素：
  //传入一个节点，和一个由含有节点属性的元素构成的数组
  //从数组中移除第一个含有该节点的元素
  static clearFromAryNode(element, array) {
    const l = array.length;
    for (var i = 0; i < l; i++) {
      if (array[i].node == element) {
        array.splice(i, 1);
        break;
      }
    }
  }

  //从该数组中移除第一个该元素（改变原始数组）
  static removeFstFromAry(
    elementToRemove,
    ary: (typeof elementToRemove)[]
  ): (typeof elementToRemove)[] {
    const index = ary.indexOf(elementToRemove);
    if (index > -1) {
      ary.splice(index, 1);
    }
    return ary;
  }
  //移除所有匹配的元素（不改变原始数组）
  static removeAllFromAry(
    elementToRemove,
    ary: (typeof elementToRemove)[]
  ): (typeof elementToRemove)[] {
    return ary.filter((element) => element !== elementToRemove);
  }
  //从数组的数组中移除指定数组（不改变原始数组）
  static removeAryFromAry(ary: any[], elementsToRemove: any[]): any[] {
    return ary.filter((element) => !elementsToRemove.includes(element));
  }

  //如果数组中没有，则添加元素
  static addToAry(element, ary: (typeof element)[]) {
    if (ary.includes(element)) {
      return;
    }
    ary.push(element);
  }

  //检查数组中是否存在具有相同指定属性的对象。
  static containsObj(obj: any, ary: any[], propName: string): boolean {
    return ary.some((el) => el[propName] === obj[propName]);
  }

  //返回数组中第一个具有与指定对象相同属性值的对象，如果不存在，则返回null。
  static findObj(obj: any, ary: any[], propName: string): any | null {
    const foundObj = ary.find((el) => el[propName] === obj[propName]);
    return foundObj ? foundObj : null;
  }

  //排序，默认升序
  static sortNum(ary: number[], ascending: boolean = true): number[] {
    return ary.sort((a, b) => (ascending ? a - b : b - a));
  }
  static sortObj<T>(
    ary: T[],
    propName: keyof T,
    ascending: boolean = true
  ): T[] {
    return ary.sort((a, b) => {
      if (typeof a[propName] === "number" && typeof b[propName] === "number") {
        return ascending
          ? (a[propName] as any) - (b[propName] as any)
          : (b[propName] as any) - (a[propName] as any);
      }
      return 0; // 如果属性不是数字，不进行排序
    });
  }
  static sortNode(
    nodes: any[],
    component: any,
    propertyName: string,
    ascending: boolean = true
  ): any[] {
    return nodes.sort((a, b) => {
      const aComponent = a.getComponent(component);
      const bComponent = b.getComponent(component);
      const aValue = aComponent[propertyName];
      const bValue = bComponent[propertyName];
      return ascending ? aValue - bValue : bValue - aValue;
    });
  }
}

export class SortTools {
  static sortAndExtract<T>(
    data: Record<string, T>,
    sortBy: keyof T,
    extractKey: keyof T
  ): (T[keyof T] | string)[] {
    // 注意返回类型可能包含字符串
    // 将 Record 转换为数组
    const dataArray = Object.values(data);

    // 按指定的键进行排序
    dataArray.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      if (typeof valueA === "number" && typeof valueB === "number") {
        return valueA - valueB;
      }
      return 0; // 如果排序键不是数字，则不进行排序
    });

    // 提取排序后的特定键的值，并处理可能的逗号分隔值
    let extractedArray: (T[keyof T] | string)[] = [];
    dataArray.forEach((item) => {
      const value = item[extractKey];
      if (typeof value === "string" && value.includes(",")) {
        extractedArray.push(...value.split(",").map((v) => v.trim())); // 分割并去除空格
      } else {
        extractedArray.push(value);
      }
    });

    return extractedArray;
  }
}

//Record
export class RecordTools {
  //找出最大的键
  static findMaxKey(table: Record<string, any>): number {
    // 转换键为数字，并找出最大值
    const maxKey = Math.max(
      ...Object.keys(table).map((key) => parseInt(key, 10))
    );
    return maxKey;
  }
  static newRecordbyField<T, K extends keyof T>(
    originalRecord: Record<string, T>,
    field: K
  ): Record<string, T[K]> {
    const newRecord: Record<string, T[K]> = {};
    for (const key in originalRecord) {
      if (originalRecord.hasOwnProperty(key)) {
        newRecord[key] = originalRecord[key][field];
      }
    }
    return newRecord;
  }

  static copy(target: object, source: object) {
    // 清空目标对象
    Object.keys(target).forEach((key) => {
      delete target[key];
    });

    // 深拷贝源对象的属性到目标对象
    Object.keys(source).forEach((key) => {
      target[key] = BaseTools.deepCopy(source[key]);
    });
  }

  static sortRecord<T>(
    record: Record<string, T>,
    propName: keyof T,
    ascending: boolean = true
  ): string[] {
    return Object.entries(record)
      .sort(([, a], [, b]) => {
        const valueA = a[propName];
        const valueB = b[propName];

        if (typeof valueA === "number" && typeof valueB === "number") {
          return ascending ? valueA - valueB : valueB - valueA;
        }
        return 0;
      })
      .map(([key]) => key);
  }
}

//随机
export class RndTools {
  //传入两个数字min和max
  //生成min和max之间的一个随机数，前闭后开
  static rndBetween(min: number, max: number) {
    return min + Math.random() * (max - min);
  }

  //传入两个数字min和max
  //生成min和max之间的一个随机整数，闭区间
  static rndIntBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  //从传入的形参中随机返回一个,可以传入多个参数或直接传入一个数组或Record
  static rndAny(...args: any[]): any {
    if (args.length === 1) {
      if (Array.isArray(args[0])) {
        // 如果参数是一个数组，则从数组中随机选择一个元素
        args = args[0];
      } else if (args[0] !== null && typeof args[0] === "object") {
        // 如果参数是一个对象，则从对象的属性中随机选择一个
        const keys = Object.keys(args[0]);
        if (keys.length === 0) return null; // 如果对象没有属性，则返回null
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        return args[0][randomKey];
      }
    }
    // 从参数列表中随机选择一个元素
    const randomIndex = Math.floor(Math.random() * args.length);
    return args[randomIndex];
  }

  //按权重表随机
  static rndByWeightTable(weightTable: Record<string, number>): string {
    let totalWeight = 0;
    const itemEntries = Object.entries(weightTable);

    itemEntries.forEach(([, weight]) => (totalWeight += weight));

    let random = Math.random() * totalWeight;
    for (const [item, weight] of itemEntries) {
      random -= weight;
      if (random <= 0) {
        return item;
      }
    }

    // 处理可能的浮点数误差
    return itemEntries[itemEntries.length - 1][0];
  }

  //按概率表随机
  static rndByProbTable(probTable: object, other = "other"): string {
    //计算其他情况的概率
    let otherProb = 1;
    for (let i in probTable) {
      otherProb -= probTable[i];
    }
    // 防止二进制误差：使用toFixed(2)将结果四舍五入到两位小数，并转换为数值类型
    otherProb = Number(otherProb.toFixed(5));
    //组成完整概率表
    const totalTable = { [other]: otherProb, ...probTable };

    // 构建概率区间
    let totalProb = 0;
    const probRanges: Array<{ key: string; upperBound: number }> = [];

    // 计算概率总和，检查是否为1，若不为1，需要调整
    let probSum = Object.values(totalTable).reduce(
      (sum, prob) => sum + prob,
      0
    );
    probSum = Number(probSum.toFixed(5));

    if (probSum !== 1) {
      Debug.warn("Total probability does not sum up to 1.");
    }

    for (const key in totalTable) {
      totalProb += totalTable[key] / probSum; // 确保总概率为1
      probRanges.push({ key, upperBound: totalProb });
    }
    Debug.warn(probRanges);
    // 生成随机数并选择结果
    const rand = Math.random();
    for (const range of probRanges) {
      if (rand < range.upperBound) {
        return range.key;
      }
    }
    //兜底，选最大概率的
    let maxProbKey = other; // 默认为"other"
    let maxProb = 0;
    for (const [key, prob] of Object.entries(probTable)) {
      if (prob > maxProb) {
        maxProb = prob;
        maxProbKey = key;
      }
    }
    return maxProbKey;
  }

  //概率随机
  static rndByProb(prob: number): boolean {
    return Math.random() < prob;
  }
}

//Debug日志
export class Debug {
  //调试日志全局开关
  static Debug: boolean = true;

  static log(...data: any[]) {
    this.Debug && console.log(...data);
  }

  static warn(...data: any[]) {
    this.Debug && console.warn(...data);
  }

  static error(...data: any[]) {
    this.Debug && console.error(...data);
  }
}

//字符串
export class StrTools {
  //首字母大写，后续小写
  static capitalizeFirstLetter(str) {
    if (!str || typeof str !== "string") {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  //按Unicode顺序排列字符串
  static sortStr(str: string): string {
    return str.split("").sort().join("");
  }

  //record转化为，隔开的字符串，消重,忽略空字符串
  static recordToStr(record: Record<string, string>): string {
    // 使用 Object.values 获取所有值，使用 Set 来消除重复，忽略空字符串
    const uniqueValues = new Set(
      Object.values(record).filter((value) => value !== "")
    );
    // 使用 Array.from 将 Set 转换回数组，然后使用 join(',') 将其连接成一个字符串
    return Array.from(uniqueValues).join(",");
  }

  //将由某种分隔符（默认为，）隔开的字符串转成数组
  static strToAry(
    str: string | number,
    delimiter: string = ","
  ): (number | string)[] {
    // 首先检查 str 是否为数字
    if (typeof str === "number") {
      return [str];
    }

    // 检查 str 是否包含指定的分隔符
    if (!str.includes(delimiter)) {
      // 尝试将 str 转换为数字
      const parsedNumber = parseInt(str.trim(), 10);
      // 如果转换成功，返回数字，否则返回原始字符串
      return isNaN(parsedNumber) ? [str.trim()] : [parsedNumber];
    }

    // 如果 str 包含指定的分隔符，按原有逻辑处理
    return str.split(delimiter).map((item) => {
      const trimmedItem = item.trim();
      const parsedNumber = parseInt(trimmedItem, 10);
      return isNaN(parsedNumber) ? trimmedItem : parsedNumber;
    });
  }
}

//节点
export class NodeTools {
  //1水平翻转，2垂直翻转，3双向翻转
  static flipNode(node: Node, type: number) {
    switch (type) {
      case 1:
        node.setScale(-node.scale.x, node.scale.y);
        break;
      case 2:
        node.setScale(node.scale.x, -node.scale.y);
        break;
      case 3:
        node.setScale(-node.scale.x, -node.scale.y);
        break;
    }
  }
  //使节点与另一节点位置完全重合，大小一致
  static coverNode(node: Node, target: Node) {
    node.setWorldPosition(target.getWorldPosition());
    const width = target.getComponent(UITransform).contentSize.width;
    const height = target.getComponent(UITransform).contentSize.height;
    node.getComponent(UITransform).contentSize.set(new Size(width, height));
  }

  //使节点在限制内等比缩放
  static scaleSizeByLimit(originalSize: Size, limit: number): Size {
    // 计算宽高比
    const aspectRatio = originalSize.width / originalSize.height;

    let newWidth = originalSize.width;
    let newHeight = originalSize.height;

    // 如果宽度超过最大长度
    if (originalSize.width > limit) {
      newWidth = limit;
      newHeight = newWidth / aspectRatio;
    }

    // 如果高度超过最大长度（也检查缩放后的高度）
    if (newHeight > limit) {
      newHeight = limit;
      newWidth = newHeight * aspectRatio;
    }

    // 返回等比缩放后的新Size
    return new Size(newWidth, newHeight);
  }
}

//策略
export class StrategyTools {
  //根据策略返回等级键，默认0
  static getLevelBasedOnStrategy(
    value: number,
    strategy: Record<number, number>
  ): number {
    let level = 0; // 默认级别

    // 将策略对象的键值对按照阈值从小到大排序，确保顺序正确
    const sortedEntries = Object.entries(strategy).sort((a, b) => {
      // 使用类型断言确保 a[1] 和 b[1] 是数字类型
      return (a[1] as number) - (b[1] as number);
    });

    for (let [key, threshold] of sortedEntries) {
      if (value >= threshold) {
        level = parseInt(key); // 更新满足条件的最高级别
      } else {
        break; // 如果当前数值小于阈值，则不需要检查更高的级别
      }
    }
    return level;
  }
}
