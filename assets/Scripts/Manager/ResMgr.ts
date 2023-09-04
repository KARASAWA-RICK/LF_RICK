import {
  assetManager,
  AudioClip,
  ImageAsset,
  instantiate,
  Node,
  sp,
  Sprite,
  SpriteAtlas,
  SpriteFrame,
  sys,
  Texture2D,
} from "cc";
import { Global, AssetType } from "../Global/Global";
import PoolMgr from "./PoolMgr";
import ConfigMgr from "./ConfigMgr";
import Singleton from "../Base/Singleton";
import { DebugTools } from "../Tools/Tools";
import { SAVE_KEY_ENUM, VAL_TYPE_ENUM } from "../Enum/Enum";
import { IView } from "../Global/Index";

/**
 *
 *资源管理单例类
 * @export
 * @class ResMgr
 * @extends {Singleton}
 */
export default class ResMgr extends Singleton {
  //懒汉单例
  static get ins() {
    return super.GetInstance<ResMgr>();
  }
  //存Bundle的对象
  private _abBundleMap: Object = {};
  //存SpriteAtlas对象 的对象
  private _atlasMap = {};
  //存Spine的对象
  private _spineMap = {};
  //存json的对象
  private _jsonAssetMap = {};
  //存音频的对象
  private _clipMap = {};
  private _loadStemp: number = null;
  private _loadTime: number = 0;
  private _totalTime: number = 0;

  //加载资源（将资源分类存放在不同对象中）

  //总体加载

  //加载指定索引的Bundle，存入_abBundleMap
  //传入一个数字（文件夹名称后缀，用作Bundle索引），一个数字（加载完成后增加的进度）
  public async loadBundle(index: number, ratio: number = 0): Promise<void> {
    if (!this._loadStemp) this._loadStemp = Date.now();
    //获取当前加载进度
    const rate = Global.LoadingRate;
    //根据索引生成Bundle 的名称
    //Bundle命名规则:Bundle1、Bundle2、Bundle3...
    const name = "Bundle" + index;
    return new Promise<void>((resolve, reject) => {
      assetManager.loadBundle(name, (err: any, bundle: any) => {
        //如果错误，打印错误信息
        if (err) {
          DebugTools.error("Bundle" + index + " load error, error==", err);
        } else {
          //如果加载成功，则存储到_abBundleMap中
          this._abBundleMap[index] = bundle;
          //打印加载成功的提示信息
          this.printTimer("Bundle" + index + "__" + "load success");
          //更新加载进度
          Global.LoadingRate = rate + ratio;
          resolve && resolve();
        }
      });
    });
  }

  //加载指定索引的的Bundle中的某种类型的资源，存入对应对象:
  //传入一个数字（资源所在的Bundle的索引），一个类型（资源类型），一个数字（加载完成后增加的进度）
  public async loadRes(
    index: number,
    type: any,
    ratio: number = 0
  ): Promise<void> {
    const rate = Global.LoadingRate;
    return new Promise<void>((resolve, reject) => {
      this._abBundleMap[index].loadDir(
        type.path,
        type.type,
        //每加载完一个资源就按比例更新进度
        (finished: number, total: number) => {
          if (ratio > 0) Global.LoadingRate = rate + (ratio * finished) / total;
        },
        (err: any, assets: any[]) => {
          if (err) {
            DebugTools.error("Error===", err);
            resolve && resolve();
          }
          let asset: any;
          //将加载的prefab存入_dictPrefab
          if (type == AssetType.Prefab) {
            for (let i = 0; i < assets.length; i++) {
              asset = assets[i];
              PoolMgr.ins.setPrefab(asset.data.name, asset);
              DebugTools.log("prefab name==", asset.data.name);
            }
          }
          //将加载的音频资源存入_clipMap
          if (type == AssetType.Sound) {
            for (let i = 0; i < assets.length; i++) {
              asset = assets[i];
              DebugTools.log("clip name==", asset.name);
              if (!this._clipMap[asset.name]) this._clipMap[asset.name] = asset;
            }
          }
          //将加载的图集资源存入_atlasMap
          if (type == AssetType.Atlas) {
            for (let i = 0; i < assets.length; i++) {
              asset = assets[i];
              DebugTools.log("atlas name==", asset.name);
              if (!this._atlasMap[asset.name])
                this._atlasMap[asset.name] = asset;
            }
          }
          //将加载的Spine动画资源存入_spineMap
          if (type == AssetType.Spine) {
            for (let i = 0; i < assets.length; i++) {
              asset = assets[i];
              DebugTools.log("spine name==", asset.name);
              if (!this._spineMap[asset.name])
                this._spineMap[asset.name] = asset;
            }
          }
          //将加载的JSON资源存入_jsonAssetMap，并存入ConfigMgr的存配置表的对象
          if (type == AssetType.Json) {
            for (let i = 0; i < assets.length; i++) {
              asset = assets[i];
              DebugTools.log("json name==", asset.name);
              ConfigMgr.ins.addTable(asset.name, asset.json);
              if (!this._jsonAssetMap[asset.name])
                this._jsonAssetMap[asset.name] = asset.json;
            }
          }
          //打印加载成功的信息
          this.printTimer(
            "Bundle" + index + "__" + type.path + "loaded success"
          );
          resolve && resolve();
        }
      );
    });
  }

  //额外加载

  //从第index个Bundle中加载名为name的音频资源，存入_clipMap
  //传入一个数字（资源所在的Bundle的索引），一个字符串（资源名称）
  public async loadSound(index: number, name: string): Promise<void> {
    let self = this;
    return new Promise<void>((resolve, reject) => {
      this._abBundleMap[index].load(name, function (err, sound: AudioClip) {
        if (err) {
          DebugTools.error("Error info===", err);
          resolve && resolve();
        }
        //存储加载的背景音乐
        if (!self._clipMap[sound.name]) self._clipMap[sound.name] = sound;
        resolve && resolve();
      });
    });
  }

  //预加载并创建prefab实例，存入对象池
  //传入一个字符串（对应prefab名称），一个数字（加载个数），一个数字（加载完成后增加的进度）
  public async preloadRes(
    name: string,
    count: number,
    ratio: number = 0
  ): Promise<void> {
    const rate = Global.LoadingRate;

    return new Promise<void>((resolve, reject) => {
      let pre = PoolMgr.ins.getPrefab(name);
      for (let i = 0; i < count; i++) {
        PoolMgr.ins.putNode(instantiate(pre));
      }
      if (ratio > 0) Global.LoadingRate = rate + ratio;
      this.printTimer("preload_" + name);
      resolve && resolve();
    });
  }

  //获取资源（从不同对象中取出资源用于使用）

  //传入一个字符串（需要获取的SpriteAtlas对象名）
  //从_atlasMap中获取对应的SpriteAtlas对象
  //返回它
  public getAtlas(name: string): SpriteAtlas {
    return this._atlasMap[name];
  }

  //传入一个字符串（需要获取的Spine）
  //从_spineMap中获取对应的Spine
  //返回它
  public getSpine(name: string): sp.SkeletonData {
    return this._spineMap[name];
  }

  //传入一个字符串（音频文件名）
  //从_clipMap中获取对应音频资源
  //返回它
  public getClip(name: string) {
    return this._clipMap[name];
  }

  //ui创建

  //加载prefab，存入_dictPrefab
  //传入一个对象（含有三个属性：bundle:number（prefab所在的Bundle索引）,path:string（所在的子文件夹路径）,name:string(prefab的名称)）
  //例如：
  //不直接用，提供给getPrefab调用
  private async loadPrefab(info): Promise<void> {
    const rate = Global.LoadingRate;
    return new Promise<void>((resolve, reject) => {
      this._abBundleMap[info.bundle].load(
        info.path + info.name,
        function (err, Prefab) {
          if (err) {
            DebugTools.error("Error info===", err);
            resolve && resolve();
          }
          PoolMgr.ins.setPrefab(info.name, Prefab);
          DebugTools.log("预制体名字===", info.name);
          resolve && resolve();
        }
      );
    });
  }

  //传入一个存放ui的prefab信息的对象（参见Global中对ui的prefab信息的定义），一个节点（父节点，可不写）
  //从_dictPool中的属性对象中获取prefab实例，挂在父节点下，如果没有则创建新的
  //返回它
  //不直接用，提供给getView调用
  private async getPrefab(prefabPath: any, parent?: Node) {
    if (PoolMgr.ins.getPrefab(prefabPath.name)) {
      return PoolMgr.ins.getNode(prefabPath.name, parent);
    }
    await this.loadPrefab(prefabPath);
    return PoolMgr.ins.getNode(prefabPath.name, parent);
  }

  //传入一个存放ui的prefab信息的对象（参见Global中对ui的prefab信息对象的定义），一个节点（父节点，可不写）
  //获取对应ui预制体实例，放入父节点
  //返回它
  public async getView(view: IView, Parent?: Node) {
    if (view.clear) {
      if (!Parent && Global.layer[view.layer].children[0]) {
        if (Global.layer[view.layer].children[0].name == view.name) return;
        PoolMgr.ins.putNode(Global.layer[view.layer].children[0]);
      }
    }
    let ParentNode = Parent ? Parent : Global.layer[view.layer];
    return await this.getPrefab(view, ParentNode);
  }

  //ui释放（销毁节点，并非入池）
  //传入一个Texture2D，并清理（并非销毁该Texture2D）
  private clearTex(tex: Texture2D) {
    if (tex && tex.refCount > 0) {
      tex.decRef();
      const image = tex.image as ImageAsset;
      if (image && image.refCount > 0) {
        image.decRef();
      }
    }
  }

  //传入一个Sprite，并清理（并非销毁该Sprite）
  private clearSprite(sp: Sprite) {
    const sf = sp.spriteFrame as SpriteFrame;
    if (sf) {
      sp.spriteFrame = null;
      if (sf && sf.refCount > 0) {
        sf.decRef();
        const tex = sf.texture as Texture2D;
        DebugTools.log("released");
        this.clearTex(tex);
      }
    }
  }

  //传入一个节点，和一个布尔值，如果不写则默认true。
  //如果true则释放Sprite的内存
  public clearUI(node: Node, clear = true) {
    if (clear) {
      const sp = node.getComponent(Sprite);
      sp && this.clearSprite(sp);
      const sps = node.getComponentsInChildren(Sprite);
      if (sps.length > 0) {
        sps.forEach((v) => {
          /* Release mem */
          this.clearSprite(v);
        });
      }
    }
    node.destroy();
  }

  //数据本地存储方法
  //传入键名key，对应值val
  //将val对应的值本地保存到key中，用于本地存储数据，例如分数
  public save(key: SAVE_KEY_ENUM, val: string | number) {
    if (typeof val === "number") {
      val = ("" + val) as string;
    }
    sys.localStorage.setItem(key, val || "");
  }

  //读取本地数据方法
  //传入键名key，字符串type（用于表示将key对应值转化成什么类型）
  //读取本地存储key对应的值，并根据传入的type将其转化为各种类型
  //不写则默认转化成数字
  public load(key: string, type = VAL_TYPE_ENUM.NUM) {
    let res: any = sys.localStorage.getItem(key);
    if (res) {
      switch (type) {
        case VAL_TYPE_ENUM.NUM:
          res = Number(res);
          break;
        case VAL_TYPE_ENUM.STR:
          res = res.toString();
          break;
      }
      return res;
    }
  }

  //打印资源加载时间

  //传递一个字符串（所加载资源的名称，可以不传，如果不传默认为""），和一个布尔值（是否加载完毕，可以不传，如果不传默认为false）
  private printTimer(name: string = "", end = false) {
    this._loadTime = Date.now() - this._loadStemp;
    this._loadStemp = Date.now();
    this._totalTime += this._loadTime;
    //打印加载时间
    DebugTools.log(name + "，load time===", this._loadTime, "ms");

    //更新全局加载历史信息
    Global.strLoadInfo =
      Global.strLoadInfo +
      name +
      "，load time===" +
      this._loadTime +
      "ms" +
      "******";

    //如果end = true，打印加载完毕+总用时
    if (end) {
      DebugTools.log("Load finish, total time===", this._totalTime, "ms");
    }
  }
}
