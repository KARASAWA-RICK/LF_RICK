import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Swipe")
export class Swipe extends Component {
  hasSwiped: boolean = false;
}
