import { _decorator, Component, Node } from "cc";
import { Debug, RndTools } from "../../Tools";
const { ccclass, property } = _decorator;

//基本面板
@ccclass("Panel")
export abstract class Panel extends Component {
  get cells(): Node[] {
    return this.node.children.slice();
  }

  //获取所有空格子
  abstract getEmptyCells(cells?: Node[]): Node[];
  //获取指定格子中的Entity
  abstract getEntity(index: number): Node | null;

  //获取第一个空Cell
  getFstEmptyCell(cells: Node[] = this.cells): Node | null {
    let emptyCells = this.getEmptyCells(cells);
    if (emptyCells.length == 0) {
      return null;
    }
    return emptyCells[0];
  }

  //随机获取一个空Cell
  getRndEmptyCell(cells: Node[] = this.cells): Node | null {
    let emptyCells = this.getEmptyCells(cells);
    if (emptyCells.length == 0) {
      return null;
    }
    let randomIndex: number = RndTools.rndIntBetween(
      0,
      this.getEmptyCells(cells).length - 1
    );
    return emptyCells[randomIndex];
  }

  //随机获取数个空Cell
  getRndEmptyCells(
    numCells: number,
    cells: Node[] = this.cells
  ): Node[] | null {
    let emptyCells = this.getEmptyCells(cells);
    if (emptyCells.length == 0 || numCells > emptyCells.length) {
      return null; // 没有足够的空格子可用
    }

    const selectedCells: Node[] = [];
    for (let i = 0; i < numCells; i++) {
      let randomIndex = Math.floor(Math.random() * emptyCells.length);
      selectedCells.push(emptyCells[randomIndex]);
      emptyCells.splice(randomIndex, 1); // 从候选池中移除已选的格子
    }

    return selectedCells;
  }

  //获取指定格子
  getCell(index: number): Node | null {
    if (index == null || index < 0 || index > this.cells.length - 1) {
      return null;
    }
    return this.cells[index];
  }

  //获取所有Entity
  getAllEntities(): Node[] {
    let entities: Node[] = [];
    for (let i = 0; i < this.cells.length; i++) {
      let entity = this.getEntity(i);
      if (entity) {
        entities.push(entity);
      }
    }
    return entities;
  }
}
