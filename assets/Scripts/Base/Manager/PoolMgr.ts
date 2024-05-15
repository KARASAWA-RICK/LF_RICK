import { _decorator, Prefab, Node, instantiate, NodePool, Vec3 } from "cc";
import Singleton from "../BaseClass/Singleton";
import { Debug } from "../Tools";
const { ccclass } = _decorator;

/**
 *
 *管理prefab与prefab实例存储的单例类
 * @export
 * @class PoolMgr
 * @extends {Singleton}
 */
@ccclass("PoolMgr")
export default class PoolMgr extends Singleton {
  static get ins() {
    return super.GetInstance<PoolMgr>();
  }
  //存 存prefab实例的对象 的对象（对象池）
  _dictPool: any = {};
  //存prefab的对象
  _dictPrefab: any = {};

  //存取/清理/复制prefab实例

  //传入一个prefab或字符串（要获取的prefab实例对应的prefab或名称），一个节点（可不传，如果传则prefab预制体挂入该父节点），一个三维坐标（可不传，如果传则将prefab预制体设置到该位置）
  //从对象池中获取一个prefab实例，如果没有则创建一个新的实例，设置父节点和位置
  //返回它
  getNode(prefab: Prefab | string, parent?: Node, pos?: Vec3): Node {
    let tempPre;
    let name;
    if (typeof prefab === "string") {
      tempPre = this._dictPrefab[prefab];
      name = prefab;
      if (!tempPre) {
        Debug.log("Pool invalid prefab name = ", name);
        return null;
      }
    } else {
      tempPre = prefab;
      name = prefab.data.name;
    }

    let node = null;
    if (this._dictPool.hasOwnProperty(name)) {
      //已有对应的对象池
      let pool = this._dictPool[name];
      if (pool.size() > 0) {
        node = pool.get();
      } else {
        node = instantiate(tempPre);
      }
    } else {
      //没有对应对象池，创建他！
      let pool = new NodePool();
      this._dictPool[name] = pool;

      node = instantiate(tempPre);
    }

    if (parent) {
      node.parent = parent;
      node.active = true;
      if (pos) node.position = pos;
    }

    return node;
  }

  //传入一个节点（要存放的prefab实例）
  //将该prefab实例放入对象池，如果没有则创建一个新的对象池用于存放
  putNode(node: Node | null) {
    if (!node) {
      return;
    }

    //Debug.log("回收信息",node.name,node)
    let name = node.name;
    let pool = null;

    if (this._dictPool.hasOwnProperty(name)) {
      //已有对应的对象池
      pool = this._dictPool[name];
    } else {
      //没有对应对象池，创建他！
      pool = new NodePool();
      this._dictPool[name] = pool;
    }

    pool.put(node);
  }

  //传入一个字符串（要销毁的prefab实例名）
  //从该对象池中销毁所有对应prefab实例
  clearPool(name: string) {
    if (this._dictPool.hasOwnProperty(name)) {
      let pool = this._dictPool[name];
      pool.clear();
    }
  }

  //传入一个节点（要复制的目标节点），一个节点（存放复制体的父节点）
  //复制目标节点，将新的复制体放入该父节点
  //返回它
  copyNode(copynode: Node, parent: Node | null): Node {
    let name = copynode.name;
    this._dictPrefab[name] = copynode;
    let node = null;
    if (this._dictPool.hasOwnProperty(name)) {
      let pool = this._dictPool[name];
      if (pool.size() > 0) {
        node = pool.get();
      } else {
        node = instantiate(copynode);
      }
    } else {
      let pool = new NodePool();
      this._dictPool[name] = pool;
      node = instantiate(copynode);
    }
    if (parent) {
      node.parent = parent;
      node.active = true;
    }
    return node;
  }

  //存取prefab（提供给ResMgr调用）

  //传入一个prefab或字符串（要存入的prefab或名称）
  //将对应prefab存入_dictPrefab中
  setPrefab(name: string, prefab: Prefab): void {
    this._dictPrefab[name] = prefab;
  }

  //传入一个字符串（要获取的prefab名）
  //从_dictPrefab中获取对应prefab
  //返回它
  getPrefab(name: string): Prefab {
    return this._dictPrefab[name];
  }
}
