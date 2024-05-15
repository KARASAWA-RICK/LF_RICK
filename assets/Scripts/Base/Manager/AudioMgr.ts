import { AudioSourceComponent, _decorator } from "cc";
import { ResMgr } from "./ResMgr";
import Singleton from "../BaseClass/Singleton";

const { ccclass } = _decorator;

/**
 *
 *音频管理单例
 * @export
 * @class AudioMgr
 * @extends {Singleton}
 */
@ccclass("AudioMgr")
export default class AudioMgr extends Singleton {
  static get ins() {
    return super.GetInstance<AudioMgr>();
  }

  constructor() {
    super();
    this.init();
  }

  private _musicAudioComp: AudioSourceComponent = null;
  private _effectComps: AudioSourceComponent[] = [];
  private _loopingEffects: Map<string, AudioSourceComponent> = new Map();
  private _curMusic: string = "";

  private init() {
    this._musicAudioComp = new AudioSourceComponent();
    this._musicAudioComp.loop = true;
    this._musicAudioComp.volume = 1;
    //初始化音效组件池，只初始化了一个，实际使用中可以根据需要增加
    let soundComp = new AudioSourceComponent();
    this._effectComps.push(soundComp);
  }

  private _isMusic = true;
  //不直接使用，音乐开关使用settingMgr
  set isMusic(v: boolean) {
    if (v) {
      this._isMusic = true;
      this.playMusic(this._curMusic);
    } else {
      this._isMusic = false;
      this.stopMusic();
    }
  }
  private _isEffect = true;
  //不直接使用，音乐开关使用settingMgr
  set isEffect(v: boolean) {
    if (v) {
      this._isEffect = true;
    } else {
      this._isEffect = false;
      this.stopAllEffects();
    }
  }

  //播放音乐
  private playMusic(musicName: string, volumeScale = 1) {
    const cur = this._curMusic;
    this._curMusic = musicName;
    if (!this._isMusic) {
      return;
    }
    if (cur === musicName && this._musicAudioComp.playing) {
      return;
    }
    this._musicAudioComp.stop();
    const clip = ResMgr.ins.getClip(musicName);
    this._musicAudioComp.volume = volumeScale;
    this._musicAudioComp.clip = clip;
    this._musicAudioComp.play();
  }
  //停止音乐
  private stopMusic() {
    this._musicAudioComp.stop();
  }

  //播放音效
  playEffect(name: string, loop = false, volumeScale = 1) {
    if (!this._isEffect) {
      return;
    }
    const clip = ResMgr.ins.getClip(name);

    // 对于循环音效，尝试复用已存在的组件
    let effectComp: AudioSourceComponent;
    if (loop && this._loopingEffects.has(name)) {
      effectComp = this._loopingEffects.get(name)!;
    } else {
      effectComp =
        this._effectComps.find((comp) => !comp.playing) ||
        new AudioSourceComponent();
      if (!this._effectComps.includes(effectComp)) {
        this._effectComps.push(effectComp);
      }
    }

    if (loop) {
      effectComp.loop = true;
      this._loopingEffects.set(name, effectComp);
    } else {
      // 非循环音效立即播放
      effectComp.playOneShot(clip, volumeScale);
    }

    // 仅当音效为循环且不在播放时，开始播放
    if (loop && !effectComp.playing) {
      effectComp.volume = volumeScale;
      effectComp.clip = clip;
      effectComp.play();
    }
  }
  //停止特定循环音效
  stopLoopingEffect(name: string) {
    if (this._loopingEffects.has(name)) {
      const effectComp = this._loopingEffects.get(name)!;
      effectComp.stop(); // 假设有stop方法
      effectComp.loop = false;
      this._loopingEffects.delete(name);
    }
  }
  //停止所有循环音效
  stopAllLoopingEffects() {
    this._loopingEffects.forEach((effectComp, audio) => {
      effectComp.stop();
      effectComp.loop = false;
    });
    this._loopingEffects.clear();
  }
  //停止所有音效
  private stopAllEffects() {
    this._effectComps.forEach((comp) => comp.stop());
  }
}
