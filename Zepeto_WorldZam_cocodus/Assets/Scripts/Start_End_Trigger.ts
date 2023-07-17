import { AudioClip, Collider, Color, GameObject, Object } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { Room } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import PlayerSync from '../Multi/Player/PlayerSync';
import DataManager from './DataManager';
import CoinManager from './Product/CoinManager';
import SoundManager from './SoundManager';

export default class Start_End_Trigger extends ZepetoScriptBehaviour {

    @SerializeField() private audioClip: AudioClip;
    @SerializeField() private goalUI: GameObject;
    @SerializeField() private invenIcon: GameObject;

    private multiplay: ZepetoWorldMultiplay;
    private room: Room;

    private invenButton: Button;
    private invenImg: Image;

    private startTrigger: bool = false;
    private finishTrigger: bool = false;

    private Start() {
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.invenButton = this.invenIcon.GetComponent<Button>();
        this.invenImg = this.invenIcon.transform.GetChild(0).transform.GetComponent<Image>();
        this.multiplay.RoomJoined += (room: Room) => {
            this.room = room;
        }
    }

    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        SoundManager.instance.BGM_Start(this.audioClip); // 각 지점에 알맞은 사운드 출력

        // 타임아웃 관련
        if (this.audioClip.name == "Stage") { // 시작위치에서 트리거되었을때
            if (this.startTrigger) // 한번 트리거되었다면 실행하지 않음
                return;

            // 타임아웃 시작
            console.log(`time out start..`);
            this.startTrigger = true;    
            this.room.Send("StartRunningRequest");
        }

        else { // 골지점에서 트리거되었을때
            if (this.finishTrigger)
                return;

            // 타임아웃 종료
            this.finishTrigger = true;
            DataManager.instance.CountEnd();
            this.goalUI.SetActive(true);
            // 성공횟수 올리고 스토리지에 저장
            DataManager.instance.ShowData(0, 1);
            DataManager.instance.SaveData();
            // 코인 스토리지 저장 및 재배치
            CoinManager.instance.CoinActive();
            // 사용한 깃발 초기화
            CoinManager.instance.FlagReset();
            // 인벤토리 아이콘 비활성화
            this.DisableInvenIcon();
 
        }
    }

    private DisableInvenIcon() {
        this.invenButton.interactable = false;
        this.invenImg.color = Color.gray;
    }

    private EnableInvenIcon() {
        this.invenButton.interactable = true;
        this.invenImg.color = Color.white;
    }

    // retry시 해당함수 실행
    public TriggerExit() {
        this.startTrigger = false;
        this.finishTrigger = false;
        
        // 인벤토리 아이콘 활성화
        this.EnableInvenIcon();
    }
}
