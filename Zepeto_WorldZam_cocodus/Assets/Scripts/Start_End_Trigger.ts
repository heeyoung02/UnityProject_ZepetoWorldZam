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
            // ���� ���丮�� ���� �� ���ġ
            CoinManager.instance.CoinActive();
            // ����� ��� �ʱ�ȭ
            CoinManager.instance.FlagReset();
            // �κ��丮 ������ ��Ȱ��ȭ
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

    // retry�� �ش��Լ� ����
    public TriggerExit() {
        this.startTrigger = false;
        this.finishTrigger = false;
        
        // �κ��丮 ������ Ȱ��ȭ
        this.EnableInvenIcon();
    }
}
