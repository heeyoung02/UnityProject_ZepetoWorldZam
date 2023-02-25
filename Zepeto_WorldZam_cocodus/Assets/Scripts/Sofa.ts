import { convertToObject } from 'typescript';
import { Collider } from 'UnityEngine';
import { UIZepetoPlayerControl } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';

export default class Sofa extends ZepetoScriptBehaviour {

    private controller: UIZepetoPlayerControl;

    Start() {    
    }

    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;

    }

}