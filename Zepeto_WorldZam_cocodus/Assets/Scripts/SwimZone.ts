import { Animator, Collider } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';

export default class SwimZone extends ZepetoScriptBehaviour {

    @SerializeField() private additionalRunSpeed: number = -1;


    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        // 수영 애니메이션으로 전환
        const animator = coll.transform.GetComponentInChildren<Animator>();
        animator.SetBool("isSwimming", true);
        // 속도 늦추기
        const zepCharacter = coll.GetComponent<PlayerSync>().zepetoPlayer.character;
        zepCharacter.additionalRunSpeed = this.additionalRunSpeed;
    }

    OnTriggerExit(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        // 애니메이션 원래대로
        coll.transform.GetComponentInChildren<Animator>().SetBool("isSwimming", false);
        // 속도 원래대로
        const zepCharacter = coll.GetComponent<PlayerSync>().zepetoPlayer.character;
        zepCharacter.additionalRunSpeed = 0;
    }

}