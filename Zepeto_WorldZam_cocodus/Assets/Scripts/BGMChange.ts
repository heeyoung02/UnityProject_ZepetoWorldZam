import { AudioClip, Collider, GameObject } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';
import DataManager from './DataManager';
import SoundManager from './SoundManager';

export default class BGMChange extends ZepetoScriptBehaviour {

    @SerializeField() private audioClip: AudioClip;
    @SerializeField() private goalUI: GameObject;

    private startTrigger: bool = false;
    private finishTrigger: bool = false;

    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        SoundManager.instance.BGM_Start(this.audioClip);


        // 타임아웃 관련
        if (this.audioClip.name == "Stage") { // 시작위치에서 트리거되었을때
            if (this.startTrigger) // 한번 트리거되었다면 실행하지 않음
                return;

            this.startTrigger = true;
            // 타임아웃 시작

            
        }
        else { // 골지점에서 트리거되었을때
            if (this.finishTrigger)
                return;

            this.finishTrigger = true;
            this.goalUI.SetActive(true);
            // 타임아웃 종료
            // ...
            // 성공횟수 올리고 스토리지에 저장
            DataManager.instance.ShowData(0,1);
            DataManager.instance.SaveData();

        }
    }

    // retry시 해당함수 실행
    public TriggerExit() {
        this.startTrigger = false;
        this.finishTrigger = false;
    }

}