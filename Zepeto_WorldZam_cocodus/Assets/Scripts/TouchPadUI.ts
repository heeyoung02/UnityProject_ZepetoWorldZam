import { AnimationClip, Animator, Camera, Quaternion, Transform, Vector3 } from 'UnityEngine'
import { Button } from 'UnityEngine.UI';
import { ZepetoPlayers, CharacterState } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';
import PadController from './PadController';

// touchpad UI에 부착
export default class TouchPadUI extends ZepetoScriptBehaviour {

    public sitIcon: Button; // 앉기 버튼
    private isSitting: bool = false;

    Start() {
        const player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.GetComponent<PlayerSync>();
        // 앉기버튼 눌렀을때의 이벤트
        this.sitIcon.onClick.AddListener(() => {
            if (!this.isSitting)
                this.SitDown(player);
            else
                this.StandUp(player);
        });
    }

    // 앉기
    private SitDown(player: PlayerSync) {
        this.isSitting = true;
        const sofaPos = player.GetComponent<PadController>().sofaPos; // player와 trigger된 소파 transform
        const sofaPosForward = sofaPos.rotation.eulerAngles;
        const eulerAngle = new Vector3(sofaPosForward.x, (sofaPosForward.y - 180), sofaPosForward.z); // y앵글에서 -180해야 정면바라봄
        player.transform.rotation = Quaternion.Euler(eulerAngle);

        player.GetComponentInChildren<Animator>().SetBool("isSitting", true); // 앉기 애니메이션 실행
        player.zepetoPlayer.character.StateMachine.Stop(); // 조작멈추기
    }

    private StandUp(player: PlayerSync) {
        this.isSitting = false;
        player.GetComponentInChildren<Animator>().SetBool("isSitting", false);
        player.zepetoPlayer.character.StateMachine.Start(CharacterState.Idle); // 조작 가능하게하기
    }


    public IconTrigger() {
        if (!this.sitIcon.gameObject.activeSelf)
            this.sitIcon.gameObject.SetActive(true);
        else
            this.sitIcon.gameObject.SetActive(false);
    }

}