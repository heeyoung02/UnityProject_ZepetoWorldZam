import { Collider, Quaternion, Transform, WaitForSeconds } from 'UnityEngine';
import { ZepetoCharacter, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';
import DataManager from './DataManager';

export default class FallCheck extends ZepetoScriptBehaviour {

    public spawnPoint: Transform;


    private OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;

        this.UserDataRenual();

        const localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        this.StartCoroutine(this.MoveSpawnPoint(localCharacter));
    }

    private *MoveSpawnPoint(player: ZepetoCharacter) {
        yield new WaitForSeconds(1); // �������� 1�� �� ������ҷ� �ڷ���Ʈ(�ִϸ��̼� ���� ����)
        player.Teleport(this.spawnPoint.position, Quaternion.identity);
    }

    private UserDataRenual() {
        console.log(`user data renual!!`);
        DataManager.instance.ShowData(1);
        DataManager.instance.SaveData();
    }

}