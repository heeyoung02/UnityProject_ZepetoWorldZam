import { AudioClip, Collider } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';
import SoundManager from './SoundManager';

export default class BGMChange extends ZepetoScriptBehaviour {

    @SerializeField() private audioClip: AudioClip;

    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        SoundManager.instance.BGM_Start(this.audioClip);
    }

}