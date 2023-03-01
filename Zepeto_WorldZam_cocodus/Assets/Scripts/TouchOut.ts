import { Animator, Collider, WaitForSeconds } from 'UnityEngine';
import { CharacterState} from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';
import ZepetoPlayersManager from '../Multi/Player/ZepetoPlayersManager';
import DataManager from './DataManager';

export default class TouchOut extends ZepetoScriptBehaviour {

    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;

        const player = coll.GetComponent<PlayerSync>();
        this.StartCoroutine(this.DieCoroutine(player));
    }

    private *DieCoroutine(player: PlayerSync) {

        DataManager.instance.ShowData(1);
        DataManager.instance.SaveData();

        const animator = player.transform.GetComponentInChildren<Animator>();
        const character = player.zepetoPlayer.character;

        animator.SetInteger("State", 109);
        animator.SetInteger("LandingState", 0);
        character.StateMachine.Stop();

        yield new WaitForSeconds(1);

        ZepetoPlayersManager.instance.MoveSpawnPoint();
        character.StateMachine.Start(CharacterState.Idle);
    }
    
}