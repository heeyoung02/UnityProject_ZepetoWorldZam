import { AudioClip, Collider, GameObject, Object } from 'UnityEngine';
import { Room } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import PlayerSync from '../Multi/Player/PlayerSync';
import DataManager from './DataManager';
import SoundManager from './SoundManager';

export default class Start_End_Trigger extends ZepetoScriptBehaviour {

    @SerializeField() private audioClip: AudioClip;
    @SerializeField() private goalUI: GameObject;

    private multiplay: ZepetoWorldMultiplay;
    private room: Room;

    public startTrigger: bool = false;
    public finishTrigger: bool = false;

    private Start() {
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.multiplay.RoomJoined += (room: Room) => {
            this.room = room;
        }
    }

    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        SoundManager.instance.BGM_Start(this.audioClip); // �� ������ �˸��� ���� ���

        // Ÿ�Ӿƿ� ����
        if (this.audioClip.name == "Stage") { // ������ġ���� Ʈ���ŵǾ�����
            if (this.startTrigger) // �ѹ� Ʈ���ŵǾ��ٸ� �������� ����
                return;

            // Ÿ�Ӿƿ� ����
            console.log(`time out start..`);
            this.startTrigger = true;    
            this.room.Send("StartRunningRequest");
        }

        else { // ���������� Ʈ���ŵǾ�����
            if (this.finishTrigger)
                return;

            // Ÿ�Ӿƿ� ����
            this.finishTrigger = true;
            DataManager.instance.CountEnd();
            this.goalUI.SetActive(true);
            // ����Ƚ�� �ø��� ���丮���� ����
            DataManager.instance.ShowData(0, 1);
            DataManager.instance.SaveData();

        }
    }

    // retry�� �ش��Լ� ����
    public TriggerExit() {
        this.startTrigger = false;
        this.finishTrigger = false;
        DataManager.instance.UIReset();
    }
}
