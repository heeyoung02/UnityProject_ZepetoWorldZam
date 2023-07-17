import { TextMeshProUGUI } from 'TMPro'
import { Color, GameObject, RectTransform, Time, Vector2, Vector3 } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ZepetoPlayersManager from '../Multi/Player/ZepetoPlayersManager';
import DataManager from './DataManager';
import Start_End_Trigger from './Start_End_Trigger';

export default class GoalUIController extends ZepetoScriptBehaviour {

    @SerializeField() private title: TextMeshProUGUI;
    @SerializeField() private retryBtn: Button;
    @SerializeField() private cancleBtn: Button;
    @SerializeField() private menuBar: GameObject;
    @SerializeField() private basicSpawnPoint: GameObject;
    @SerializeField() private goalPanelObj: GameObject;

    private start_end_triggers: Start_End_Trigger[];

    private titleTxt: string;
    private colorIndex: number = -1;

    Start() {
        this.start_end_triggers = GameObject.FindObjectsOfType<Start_End_Trigger>();
        this.titleTxt = this.title.text;

        this.retryBtn.onClick.AddListener(() => {
            this.Retry();
        });
        this.cancleBtn.onClick.AddListener(() => {
            this.goalPanelObj.SetActive(false);
            this.menuBar.gameObject.SetActive(true);
        });
    }   

    OnEnable() {
        this.StartCoroutine(this.TextAlphaChange());
    }

    OnDisable() {
        this.StopAllCoroutines();
    }

    // text alpha값 0.3부터 시작하여 1초동안 1로 올림
    private *TextAlphaChange() {
        this.title.color = new Color(this.title.color.r, this.title.color.g, this.title.color.b, 0.3);
        while (this.title.color.a < 1) {
            this.title.color = new Color(this.title.color.r, this.title.color.g, this.title.color.b, this.title.color.a + (Time.deltaTime / 1));
            yield null;
        }
        this.StartCoroutine(this.TextColorChange());
    }

    // text color 변경한 뒤 alpha값 1부터 1초동안 0.3으로 내림
    private *TextColorChange() {
        this.title.text = this.ColorPick();
        this.title.color = new Color(this.title.color.r, this.title.color.g, this.title.color.b, 1);
        while (this.title.color.a > 0.3) {
            this.title.color = new Color(this.title.color.r, this.title.color.g, this.title.color.b, this.title.color.a - (Time.deltaTime / 1));
            yield null;
        }
        this.StartCoroutine(this.TextAlphaChange());
    }

    // 파, 초, 빨, 노, 보 순서대로 컬러값 변경한 text return
    private ColorPick(): string {
        const colorCodes: string[] = ["#205BB7", "#44B720", "#B72E20", "#B79A20", "#7221A8"];
        let resultIndex: number = this.colorIndex < colorCodes.length - 1 ? this.colorIndex + 1 : 0;
        this.colorIndex = resultIndex;
        const colorTxt: string = `<color=${colorCodes[resultIndex]}>${this.titleTxt}</color>`;
        return colorTxt;
    }

    // retry 버튼 클릭시
    public Retry() {
        this.start_end_triggers.forEach((ele : Start_End_Trigger) => {
            ele.TriggerExit();
        });
        this.goalPanelObj.SetActive(false);
        // 스폰포인트로 이동
        ZepetoPlayersManager.instance.MoveSpawnPoint(this.basicSpawnPoint.transform.position);
        DataManager.instance.UIReset();
    }

}