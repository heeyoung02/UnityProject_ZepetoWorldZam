import { Collider } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';
import SitButton from './SitButton';

export default class Sofa extends ZepetoScriptBehaviour {

    @SerializeField() private sitIcon: Button;

    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        this.sitIcon.gameObject.SetActive(true);
        this.sitIcon.GetComponent<SitButton>().sofaTransform = this.transform;
    }

    OnTriggerExit(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        this.sitIcon.gameObject.SetActive(false);
        this.sitIcon.GetComponent<SitButton>().sofaTransform = null;
    }
}