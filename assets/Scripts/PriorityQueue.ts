import { IGrid } from "./MapMgr";

export class PriorityQueue {
  private items: IGrid[] = [];

  enqueue(item: IGrid) {
    this.items.push(item);
    this.sort();
  }

  dequeue(): IGrid | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  contains(x: number, y: number): boolean {
    return this.items.some((item) => item.x === x && item.y === y);
  }

  update(node: IGrid): void {
    // 可以选择在此方法中更新节点信息并重新排序
    let foundIndex = this.items.findIndex(
      (item) => item.x === node.x && item.y === node.y
    );
    if (foundIndex !== -1) {
      this.items[foundIndex] = node;
      this.sort();
    } else {
      this.enqueue(node);
    }
  }

  private sort() {
    this.items.sort((a, b) => a.f - b.f);
  }
}
