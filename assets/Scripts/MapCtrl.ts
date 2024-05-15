import {
  _decorator,
  Component,
  Node,
  Vec3,
  Sprite,
  UITransform,
  Color,
  v3,
  Layers,
  UIOpacity,
} from "cc";
import { ResMgr } from "./Base/Manager/ResMgr";
import { IGrid, IMap, MapMgr } from "./MapMgr";
import { PriorityQueue } from "./PriorityQueue";
import { AlgorithmTools, Debug } from "./Base/Tools";

const { ccclass, property } = _decorator;

@ccclass("MapCtrl")
export default class MapCtrl extends Component {
  //网格宽度
  @property
  tileWidth: number = 128;
  
  //网格高度
  @property
  tileHeight: number = 128;
  //章节
  @property
  chapter: number = 1;
  //关卡
  @property
  level: number = 1;
  //是否打开格子显示
  @property
  isShowGrid: boolean = false;
  //当前地图数据
  mapData: IMap = null;

  get bg(): Node {
    return this.node.getChildByPath("Bg");
  }
  get bgWidth(): number {
    return this.bg.getComponent(UITransform).width;
  }
  get bgHeight(): number {
    return this.bg.getComponent(UITransform).height;
  }
  get gridShow(): Node {
    return this.node.getChildByPath("GridShow");
  }

  init(
    chapter: number,
    level: number,
    isShowGrid: boolean,
    tileWidth: number,
    tileHeight: number
  ) {
    this.chapter = chapter;
    this.level = level;
    this.isShowGrid = isShowGrid;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.mapData = MapMgr.ins.getMapConfig(this.chapter, this.level);
    this.addBg();
    if (this.isShowGrid) this.showGrid();
  }

  //添加背景
  addBg() {
    const sprite = this.bg.addComponent(Sprite);
    sprite.spriteFrame = ResMgr.ins.getSpriteFrame(
      this.chapter + "-" + this.level
    );
    sprite.type = Sprite.Type.SIMPLE;
    sprite.trim = false;
    sprite.sizeMode = Sprite.SizeMode.RAW;
  }
  //显示格子
  showGrid() {
    for (let y = 0; y < this.mapData.h; y++) {
      for (let x = 0; x < this.mapData.w; x++) {
        //生成格子
        const grid = new Node(`Tile-${x}-${y}`);
        grid.layer = Layers.Enum.UI_2D;
        grid.setParent(this.gridShow);
        //定位
        grid.setPosition(
          v3(
            x * this.tileWidth - this.bgWidth / 2 + this.tileWidth / 2,
            -y * this.tileHeight + this.bgHeight / 2 - this.tileHeight / 2,
            0
          )
        );
        //尺寸
        grid
          .addComponent(UITransform)
          .setContentSize(this.tileWidth, this.tileHeight);
        //颜色 + 透明
        const sprite = grid.addComponent(Sprite);
        sprite.type = Sprite.Type.SIMPLE;
        sprite.trim = false;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = ResMgr.ins.getSpriteFrame("default_sprite_splash");
        sprite.color = this.mapData.grids[y][x].walkable
          ? new Color(Color.GREEN)
          : new Color(Color.RED);
        const uiOpacity = grid.addComponent(UIOpacity);
        uiOpacity.opacity = 80;
      }
    }
  }

  //获取格子数据
  getGridData(x: number, y: number): IGrid | null {
    if (x < 0 || x >= this.mapData.w || y < 0 || y >= this.mapData.h) {
      return null;
    }
    return this.mapData.grids[y][x];
  }
  //根据世界坐标计算是否可通行
  isWalkable(worldPos: Vec3): boolean {
    // 场景左上角坐标
    const leftTopWorldPos: Vec3 = v3(
      this.bg.getWorldPosition().x - this.bgWidth / 2,
      this.bg.getWorldPosition().y + this.bgHeight / 2,
      0
    );
    // 转换世界坐标为相对于网格(0,0)左上角的坐标
    const dX = worldPos.x - leftTopWorldPos.x; // 假设场景中心在网格(0,0)的左上角
    const dY = leftTopWorldPos.y - worldPos.y; // Y坐标同理，需要从中心往上调整
    // 将相对坐标转换为网格索引
    const gridX = Math.floor(dX / this.tileWidth);
    const gridY = Math.floor(dY / this.tileHeight);
    Debug.warn("Grid Coordinates:", gridX, gridY);
    // 检查索引是否在网格边界内
    if (
      gridX >= 0 &&
      gridX < this.mapData.w &&
      gridY >= 0 &&
      gridY < this.mapData.h
    ) {
      // 返回该格子的可通行性
      return this.mapData.grids[gridY][gridX].walkable;
    }
    // 如果索引超出网格边界，返回不可通行
    return false;
  }

  //寻路
  findPath(startX, startY, endX, endY): IGrid[] | null {
    const openSet = new PriorityQueue();
    const closedSet = new Set<IGrid>();
    const start: IGrid = this.getGridData(startX, startY);
    const end: IGrid = this.getGridData(endX, endY);
    const startNode: IGrid = {
      ...start,
      g: 0,
      h: AlgorithmTools.manhattan(start.x, start.y, end.x, end.y),
      f: AlgorithmTools.manhattan(start.x, start.y, end.x, end.y),
      parent: null,
    };

    openSet.enqueue(startNode);

    while (!openSet.isEmpty()) {
      const currentNode = openSet.dequeue();
      if (currentNode.x === end.x && currentNode.y === end.y) {
        // Found the path
        return this.reconstructPath(currentNode);
      }

      closedSet.add(currentNode);
      let neighbors = this.getNeighborGrids(currentNode.x, currentNode.y);
      for (let neighbor of neighbors) {
        if (closedSet.has(neighbor)) continue;
        let tentativeG = currentNode.g + 1;
        if (
          !openSet.contains(neighbor.x, neighbor.y) ||
          tentativeG < neighbor.g
        ) {
          neighbor.g = tentativeG;
          neighbor.h = AlgorithmTools.manhattan(
            neighbor.x,
            end.x,
            neighbor.y,
            end.y
          );
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = currentNode;
          openSet.update(neighbor);
        }
      }
    }
    return null; // No path found
  }
  //获取指定格子周围可通行的格子，8向
  private getNeighborGrids(x: number, y: number): IGrid[] {
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 }, // 横向移动
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }, // 纵向移动
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 }, //斜向移动
    ];
    const result = [];
    for (const dir of directions) {
      const neighbor = this.getGridData(x + dir.dx, y + dir.dy);
      if (neighbor && neighbor.walkable) {
        result.push(neighbor);
      }
    }
    return result;
  }
  private reconstructPath(end: IGrid): IGrid[] {
    let path = [];
    let current = end;
    while (current !== null) {
      path.unshift(current);
      current = current.parent;
    }
    return path;
  }
}
