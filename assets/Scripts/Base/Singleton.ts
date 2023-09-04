/**
 *懒汉单例基类
 *
 * @export
 * @class Singlton
 */
export default class Singleton {
  private static _ins: any = null;

  public static GetInstance<T extends Singleton>(): T {
    if (!this._ins) {
      this._ins = new this();
    }
    return this._ins;
  }
}
