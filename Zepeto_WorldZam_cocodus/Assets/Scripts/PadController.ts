import { ZepetoInputControl } from 'RootNamespace';
import { Collider, GameObject, Object, Transform } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import TouchPadUI from './TouchPadUI';

// local player�� ����
export default class PadController extends ZepetoScriptBehaviour {

    private padUI: TouchPadUI;
    public sofaPos: Transform;

    Start() {
        // �����е� ����
        var myJoyPad = Object.Instantiate<GameObject>(ZepetoPlayers.instance.controllerData.horizontalController);
        this.padUI = myJoyPad.GetComponent<TouchPadUI>();
    }

    OnTriggerEnter(Coll: Collider) {
        if (Coll.CompareTag("Sofa")) {
            this.sofaPos = Coll.transform;
            this.padUI.IconTrigger();
        }
    }

    OnTriggerExit(Coll: Collider) {
        if (Coll.CompareTag("Sofa")) {
            this.sofaPos = null;
            this.padUI.IconTrigger();
        }
    }
}