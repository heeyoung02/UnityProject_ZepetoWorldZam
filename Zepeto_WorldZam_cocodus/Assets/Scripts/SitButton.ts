import { Animator, Quaternion, Transform, Vector3 } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { CharacterState, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';

export default class SitButton extends ZepetoScriptBehaviour {

    private isSitting: bool = false;
    private sitButton: Button;

    @HideInInspector() public sofaTransform: Transform;


    Start() {    
        const player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.GetComponent<PlayerSync>();
        this.sitButton = this.GetComponent<Button>();
        this.sitButton.onClick.AddListener(() => {
            this.SitBtnClick(player);
        });
    }

    public SitBtnClick(player: PlayerSync) {
        if (!this.isSitting) 
            this.SitDown(player);
        else 
            this.StandUp(player);
    }

    // �ɱ�
    private SitDown(player: PlayerSync) {
        this.isSitting = true;
        const sofaPosForward = this.sofaTransform.rotation.eulerAngles;
        const eulerAngle = new Vector3(sofaPosForward.x, (sofaPosForward.y - 180), sofaPosForward.z); // y�ޱۿ��� -180�ؾ� ����ٶ�
        player.transform.rotation = Quaternion.Euler(eulerAngle);
        player.GetComponentInChildren<Animator>().SetBool("isSitting", true); // �ɱ� �ִϸ��̼� ����
        player.zepetoPlayer.character.StateMachine.Stop(); // ���۸��߱�
    }

    // ����
    private StandUp(player: PlayerSync) {
        this.isSitting = false;
        player.GetComponentInChildren<Animator>().SetBool("isSitting", false);
        player.zepetoPlayer.character.StateMachine.Start(CharacterState.Idle); // ���� �����ϰ��ϱ�
    }
}