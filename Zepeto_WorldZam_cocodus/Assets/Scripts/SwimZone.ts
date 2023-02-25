import { Animator, Collider } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';

export default class SwimZone extends ZepetoScriptBehaviour {

    @SerializeField() private additionalRunSpeed: number = -1;


    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        // ���� �ִϸ��̼����� ��ȯ
        const animator = coll.transform.GetComponentInChildren<Animator>();
        animator.SetBool("isSwimming", true);
        // �ӵ� ���߱�
        const zepCharacter = coll.GetComponent<PlayerSync>().zepetoPlayer.character;
        zepCharacter.additionalRunSpeed = this.additionalRunSpeed;
    }

    OnTriggerExit(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        // �ִϸ��̼� �������
        coll.transform.GetComponentInChildren<Animator>().SetBool("isSwimming", false);
        // �ӵ� �������
        const zepCharacter = coll.GetComponent<PlayerSync>().zepetoPlayer.character;
        zepCharacter.additionalRunSpeed = 0;
    }

}