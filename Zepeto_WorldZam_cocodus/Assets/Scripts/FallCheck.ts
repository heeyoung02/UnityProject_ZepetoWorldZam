import { Collider, Quaternion, Transform, WaitForSeconds } from 'UnityEngine';
import { ZepetoCharacter, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';

export default class FallCheck extends ZepetoScriptBehaviour {

    public spawnPoint: Transform;

    private OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        const localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        this.StartCoroutine(this.MoveSpawnPoint(localCharacter));
    }

    private *MoveSpawnPoint(player: ZepetoCharacter) {
        yield new WaitForSeconds(1); // �������� 1�� �� ������ҷ� �ڷ���Ʈ(�ִϸ��̼� ���� ����)
        player.Teleport(this.spawnPoint.position, Quaternion.identity);
    }

}