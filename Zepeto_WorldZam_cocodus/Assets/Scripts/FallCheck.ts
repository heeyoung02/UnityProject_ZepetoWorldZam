import { Collider, WaitForSeconds } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';
import ZepetoPlayersManager from '../Multi/Player/ZepetoPlayersManager';
import DataManager from './DataManager';

export default class FallCheck extends ZepetoScriptBehaviour {

    private OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        this.UserDataRenual();
        this.StartCoroutine(this.MoveSpawnPoint());
    }

    private *MoveSpawnPoint() {
        yield new WaitForSeconds(1); // �������� 1�� �� ������ҷ� �ڷ���Ʈ(�ִϸ��̼� ���� ����)
        ZepetoPlayersManager.instance.MoveSpawnPoint();
    }

    private UserDataRenual() {
        DataManager.instance.ShowData(1);
        DataManager.instance.SaveData();
    }

}