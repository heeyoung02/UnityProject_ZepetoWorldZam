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
        yield new WaitForSeconds(1); // 떨어진지 1초 뒤 스폰장소로 텔레포트(애니메이션 동작 위해)
        ZepetoPlayersManager.instance.MoveSpawnPoint();
    }

    private UserDataRenual() {
        DataManager.instance.ShowData(1);
        DataManager.instance.SaveData();
    }

}