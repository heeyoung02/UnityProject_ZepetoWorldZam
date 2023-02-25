import { Animator, Collider, Quaternion, Transform, WaitForSeconds } from 'UnityEngine';
import { CharacterState, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';

export default class TouchOut extends ZepetoScriptBehaviour {

    public spawnPoint: Transform;

    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        console.log("die!!!");

        const player = coll.GetComponent<PlayerSync>();
        this.StartCoroutine(this.DieCoroutine(player));

    }

    private *DieCoroutine(player: PlayerSync) {

        const animator = player.transform.GetComponentInChildren<Animator>();
        const character = player.zepetoPlayer.character;

        animator.SetInteger("State", 109);
        animator.SetInteger("LandingState", 0);
        character.StateMachine.Stop();

        yield new WaitForSeconds(1);

        character.StateMachine.Start(CharacterState.Idle);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(this.spawnPoint.position, Quaternion.identity);
    }
    
}