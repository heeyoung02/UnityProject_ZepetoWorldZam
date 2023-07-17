import { Collider, Quaternion } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import CoinManager from './CoinManager';

export default class CoinController extends ZepetoScriptBehaviour {


    OnTriggerEnter(coll: Collider) {
        if (coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()) {
            return;
        }

        // UI��ȭ
        CoinManager.instance.AddCoin();
        CoinManager.instance.PutCoinObj(this.gameObject);

        // ������Ʈ ���� ���� �� ��Ȱ��ȭ
        this.transform.rotation = Quaternion.Euler(90, 0, 0);
        this.gameObject.SetActive(false);

    }

}