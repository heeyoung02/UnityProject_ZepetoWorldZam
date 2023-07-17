import { Animator, Collider, Object, WaitForSeconds } from 'UnityEngine';
import { CharacterState} from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';
import ZepetoPlayersManager from '../Multi/Player/ZepetoPlayersManager';
import DataManager from './DataManager';
import FallCheck from './FallCheck';

export default class TouchOut extends ZepetoScriptBehaviour {

    private fallCheck: FallCheck;

    private Start() {
        this.fallCheck = Object.FindObjectOfType<FallCheck>();
    }

    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal || ZepetoPlayersManager.instance.dying)
            return;
        const player = coll.GetComponent<PlayerSync>();
        this.StartCoroutine(this.DieCoroutine(player));
    }

    private *DieCoroutine(player: PlayerSync) {
        console.log(`dying coroutine start`);
        ZepetoPlayersManager.instance.dying = true;

        DataManager.instance.ShowData(1);
        DataManager.instance.SaveData();

        const animator = player.transform.GetComponentInChildren<Animator>();
        const character = player.zepetoPlayer.character;

        animator.SetInteger("State", 109);
        animator.SetInteger("LandingState", 0);
        character.StateMachine.Stop();

        yield new WaitForSeconds(1);

        this.fallCheck.SpawnPositionChecking();
        character.StateMachine.Start(CharacterState.Idle);
    }
    
}