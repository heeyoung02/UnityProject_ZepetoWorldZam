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


        // Ÿ�Ӿƿ� ����
        if (this.audioClip.name == "Stage") { // ������ġ���� Ʈ���ŵǾ�����
            if (this.startTrigger) // �ѹ� Ʈ���ŵǾ��ٸ� �������� ����
                return;

            this.startTrigger = true;
            // Ÿ�Ӿƿ� ����

            
        }
        else { // ���������� Ʈ���ŵǾ�����
            if (this.finishTrigger)
                return;

            this.finishTrigger = true;
            this.goalUI.SetActive(true);
            // Ÿ�Ӿƿ� ����
            // ...
            // ����Ƚ�� �ø��� ���丮���� ����
            DataManager.instance.ShowData(0,1);
            DataManager.instance.SaveData();

        }
    }

    // retry�� �ش��Լ� ����
    public TriggerExit() {
        this.startTrigger = false;
        this.finishTrigger = false;
    }

}