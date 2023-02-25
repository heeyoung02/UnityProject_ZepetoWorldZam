import { AnimationClip, Animator, Camera, Quaternion, Transform, Vector3 } from 'UnityEngine'
import { Button } from 'UnityEngine.UI';
import { ZepetoPlayers, CharacterState } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';
import PadController from './PadController';

// touchpad UI�� ����
export default class TouchPadUI extends ZepetoScriptBehaviour {

    public sitIcon: Button; // �ɱ� ��ư
    private isSitting: bool = false;

    Start() {
        const player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.GetComponent<PlayerSync>();
        // �ɱ��ư ���������� �̺�Ʈ
        this.sitIcon.onClick.AddListener(() => {
            if (!this.isSitting)
                this.SitDown(player);
            else
                this.StandUp(player);
        });
    }

    // �ɱ�
    private SitDown(player: PlayerSync) {
        this.isSitting = true;
        const sofaPos = player.GetComponent<PadController>().sofaPos; // player�� trigger�� ���� transform
        const sofaPosForward = sofaPos.rotation.eulerAngles;
        const eulerAngle = new Vector3(sofaPosForward.x, (sofaPosForward.y - 180), sofaPosForward.z); // y�ޱۿ��� -180�ؾ� ����ٶ�
        player.transform.rotation = Quaternion.Euler(eulerAngle);

        player.GetComponentInChildren<Animator>().SetBool("isSitting", true); // �ɱ� �ִϸ��̼� ����
        player.zepetoPlayer.character.StateMachine.Stop(); // ���۸��߱�
    }

    private StandUp(player: PlayerSync) {
        this.isSitting = false;
        player.GetComponentInChildren<Animator>().SetBool("isSitting", false);
        player.zepetoPlayer.character.StateMachine.Start(CharacterState.Idle); // ���� �����ϰ��ϱ�
    }


    public IconTrigger() {
        if (!this.sitIcon.gameObject.activeSelf)
            this.sitIcon.gameObject.SetActive(true);
        else
            this.sitIcon.gameObject.SetActive(false);
    }

}