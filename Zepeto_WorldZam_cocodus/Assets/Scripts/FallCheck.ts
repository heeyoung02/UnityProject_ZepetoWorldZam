import { Collider, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';
import ZepetoPlayersManager from '../Multi/Player/ZepetoPlayersManager';
import DataManager from './DataManager';
import CoinManager from './Product/CoinManager';

export default class FallCheck extends ZepetoScriptBehaviour {

    // spawn point - �⺻
    @SerializeField() private basicSpawnPoint: Transform;
    // spawn point - ������ ��� ���
    private userSpawnPoint: Vector3;

    //private spawnItemUsing: boolean = false;

    private OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        this.UserDataRenual();
        this.StartCoroutine(this.MoveSpawnPoint());
    }

    private *MoveSpawnPoint() {
        yield new WaitForSeconds(1); // �������� 1�� �� ������ҷ� �ڷ���Ʈ(�ִϸ��̼� ���� ����)
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
            // �������� ������� ���� ���¶�� �⺻ ��ġ�� �̵�
            ZepetoPlayersManager.instance.MoveSpawnPoint(this.basicSpawnPoint.position);
        }

        else if (usingItem) {
            // �������� ��ٸ� ����� ��ġ�� �̵�
            ZepetoPlayersManager.instance.MoveSpawnPoint(this.userSpawnPoint);
            CoinManager.instance.PrevFlagHide();
            CoinManager.instance.spawnItemUsing = false;
        }
    }

}