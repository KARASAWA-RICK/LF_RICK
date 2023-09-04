import { AudioSourceComponent, _decorator } from "cc";
import ResMgr from "./ResMgr";
import Singleton from "../Base/Singleton";

const { ccclass } = _decorator;

/**
 *
 *音频管理单例类
 * @export
 * @class AudioMgr
 * @extends {Singleton}
 */
@ccclass("AudioMgr")
export default class AudioMgr extends Singleton {
  //懒汉单例
  public static get ins() {
    return super.GetInstance<AudioMgr>();
  }

  constructor() {
    //子类构造函数里必须先调用父类构造函数
    super();
    this.init();
  }
  //单次播放的音频组件
  private _audioComp: AudioSourceComponent = null;

  //循环播放的音频组件
  private _audioLoopComp: AudioSourceComponent = null;

  //当前循环播放的音频名称
  private _curLoopAudioName: string = "";

  //初始化_audioComp与_audioLoopComp两个音频组件
  protected init() {
    //创建_audioComp的音频组件
    this._audioComp = new AudioSourceComponent();
    //设置_audioComp循环播放
    this._audioComp.loop = true;
    //创建_audioLoopComp的音频组件
    this._audioLoopComp = new AudioSourceComponent();
    //设置_audioLoopComp循环播放
    this._audioLoopComp.loop = true;
    //设置_audioLoopComp音量为30%
    this._audioLoopComp.volume = 0.3;
  }

  //传入一个字符串（要播放的音频名）
  //在_audioComp上循环播放该音频
  public async playMusic(audio: string) {
    //如果_audioComp上存在音频资源，则播放
    if (this._audioComp.clip) {
      this._audioComp.play();
      return;
    }

    //如果_audioComp上没有音频资源，则获取对应音频资源
    let clip = await ResMgr.ins.getClip(audio);
    //设置_audioComp音量为60%
    this._audioComp.volume = 0.6;
    //导入该音频
    this._audioComp.clip = clip;
    //播放该音频
    this._audioComp.play();
  }

  //停止播放_audioComp上的音频
  public stopMusic() {
    this._audioComp.stop();
  }

  //传入一个字符串（要播放的音频名），传入一个数字（可以不传，如果不传默认1，表示音量缩放比例）
  //播放一次_audioComp上的音频
  public async playSound(audio: string, scale = 1) {
    let clip = await ResMgr.ins.getClip(audio);
    this._audioComp.playOneShot(clip, scale);
  }

  //传入一个字符串（要播放的音频）
  //在_audioLoopComp上循环播放该音频
  public async playLoopSound(audio: string): Promise<void> {
    let clip = await ResMgr.ins.getClip(audio);
    this._audioLoopComp.stop();
    this._audioLoopComp.clip = clip;
    this._audioLoopComp.play();
    this._curLoopAudioName = audio;
  }

  //停止播放_audioLoopComp上的音频
  public async stopLoopSound(): Promise<void> {
    this._audioLoopComp.stop();
  }

  //获取_audioLoopComp上存在的音频
  public get curLoopAudioName(): string {
    return this._curLoopAudioName;
  }

  //获取_audioLoopComp是否在播放
  public isLoopAudioPlaying(): boolean {
    return this._audioLoopComp.playing;
  }

  //获取_audioLoop是否在播放
  public isMusicPlaying(): boolean {
    return this._audioComp.playing;
  }
}
