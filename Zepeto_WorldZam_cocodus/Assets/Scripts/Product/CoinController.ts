import { Collider, Quaternion } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import CoinManager from './CoinManager';

export default class CoinController extends ZepetoScriptBehaviour {


    OnTriggerEnter(coll: Collider) {
        if (coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()) {
            return;
        }

        // UI변화
        CoinManager.instance.AddCoin();
        CoinManager.instance.PutCoinObj(this.gameObject);

        // 오브젝트 각도 복귀 후 비활성화
        this.transform.rotation = Quaternion.Euler(90, 0, 0);
        this.gameObject.SetActive(false);

    }

}