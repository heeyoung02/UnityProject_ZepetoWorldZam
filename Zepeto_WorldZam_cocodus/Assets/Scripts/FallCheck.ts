import { Collider, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';
import ZepetoPlayersManager from '../Multi/Player/ZepetoPlayersManager';
import DataManager from './DataManager';
import CoinManager from './Product/CoinManager';

export default class FallCheck extends ZepetoScriptBehaviour {

    // spawn point - 기본
    @SerializeField() private basicSpawnPoint: Transform;
    // spawn point - 아이템 사용 장소
    private userSpawnPoint: Vector3;

    //private spawnItemUsing: boolean = false;

    private OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        this.UserDataRenual();
        this.StartCoroutine(this.MoveSpawnPoint());
    }

    private *MoveSpawnPoint() {
        yield new WaitForSeconds(1); // 떨어진지 1초 뒤 스폰장소로 텔레포트(애니메이션 동작 위해)
        this.SpawnPositionChecking();
    }

    private UserDataRenual() {
        DataManager.instance.ShowData(1);
        DataManager.instance.SaveData();
    }

    public SpawnItemUse(itemTransformPos: Vector3) {
        this.userSpawnPoint = itemTransformPos;
    }

    public SpawnPositionChecking() {

        var usingItem = CoinManager.instance.spawnItemUsing;
        if (!usingItem) {
            // 아이템을 사용하지 않은 상태라면 기본 위치로 이동
            ZepetoPlayersManager.instance.MoveSpawnPoint(this.basicSpawnPoint.position);
        }

        else if (usingItem) {
            // 아이템을 썼다면 사용한 위치로 이동
            ZepetoPlayersManager.instance.MoveSpawnPoint(this.userSpawnPoint);
            CoinManager.instance.PrevFlagHide();
            CoinManager.instance.spawnItemUsing = false;
        }
    }

}