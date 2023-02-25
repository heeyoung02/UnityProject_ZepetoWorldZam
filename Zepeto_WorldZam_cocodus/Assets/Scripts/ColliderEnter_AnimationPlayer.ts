import { Animation, Collider } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';

export default class ColliderEnter_AnimationPlayer extends ZepetoScriptBehaviour {

    private openAnim: Animation;

    Start() {
        this.openAnim = this.GetComponentInChildren<Animation>();
    }

    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        this.openAnim.Play();
    }

}