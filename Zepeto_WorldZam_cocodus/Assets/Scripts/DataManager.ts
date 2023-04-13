import { TextMeshPro, TextMeshProUGUI } from 'TMPro';
import { GameObject, Object } from 'UnityEngine';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World'

export default class DataManager extends ZepetoScriptBehaviour {

    @SerializeField() private tryTxt: TextMeshProUGUI;
    @SerializeField() private sucTxt: TextMeshProUGUI;
    @SerializeField() private timeTxt: TextMeshProUGUI;
    @SerializeField() private bestTimeTxt: TextMeshProUGUI;

    private multiplay: ZepetoWorldMultiplay;
    private room: Room;

    // �ܺο��� �б�����
    public UserTryCnt(): number {
        return this.userTryCnt;
    };
    public UserSuccessCnt(): number {
        return this.userSuccessCnt;
    };

    private userTryCnt: number;
    private userSuccessCnt: number;

    private counting: bool = false;

    /* Singleton */
    private static m_instance: DataManager = null;
    public static get instance(): DataManager {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<DataManager>();
            if (this.m_instance === null) {
                this.m_instance = new GameObject(DataManager.name).AddComponent<DataManager>();
            }
        }
        return this.m_instance;
    }
    private Awake() {
        if (DataManager.m_instance !== null && DataManager.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            DataManager.m_instance = this;
            GameObject.DontDestroyOnLoad(this.gameObject);
        }
    }

    Start() {
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();

        this.multiplay.RoomJoined += (room: Room) => {
            this.room = room;
            // �������� loadPlayerData�� ����� ����� ����
            this.room.AddMessageHandler("PlayerData", (playerData: PlayerData) => {
                // ó�� �뿡 ���������� client�� dataStorage�� ��ϵ� ���� �ҷ��ͼ� �������� ������ ��
                console.log(`player data load!! dead count is : ${playerData.playerDeadCount}, success count is : ${playerData.playerSuccessCount}`);
                this.userTryCnt = playerData.playerDeadCount;
                this.userSuccessCnt = playerData.playerSuccessCount;

                this.tryTxt.text = playerData.playerDeadCount.toString();
                this.sucTxt.text = playerData.playerSuccessCount.toString();
            });

            this.room.AddMessageHandler("LabTimeData", (labTimeData: number) => {
                console.log(`prev save lab time is : [${labTimeData}]`);
                this.bestTimeTxt.text = labTimeData.toString();
            });

            // �������� Ʈ���Ž� 
            this.room.AddMessageHandler("CountDownStart", (startServerTime: number) => {
                this.counting = true;
                this.StartCoroutine(this.CountStart(startServerTime));
            });

            // �������� Ʈ���Ž�
            this.room.AddMessageHandler("ResponseGameReport", (gameReport: GameReport) => {
                this.StopAllCoroutines();
                this.GameReport(gameReport.playerUserId, gameReport.playerLapTime);
            });
        }
    }

    private GameReport(playerUserId: string, playerLapTime: number) {
        console.log(`Game Report - playerUserId is [${playerUserId}] , playerLapTime is [${playerLapTime}]`);
        let bestLapTime = parseFloat(this.bestTimeTxt.text);
        if (playerLapTime < bestLapTime)
            this.bestTimeTxt.text = playerLapTime.toString();
    }

    private *CountStart(startTime: number) {
        const _startTime = startTime / 1000
        let elapsedTime: number = 0;

        while (this.counting) {
            // ���� �ð� ����
            const endTime = +new Date();

            // ��� �ð� ���
            elapsedTime = (endTime / 1000) - _startTime;

            const textTime = elapsedTime.toFixed(2); // �帥 �ð��� 00.00���� �ڸ��� string���� ����ȯ
            this.timeTxt.text = textTime; // �ؽ�Ʈ UI�� �����ֱ�

            // 0.01�� ���
            yield new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    public CountEnd() {
        this.counting = false;
        this.room.Send("FinishPlayer", this.timeTxt.text); // labtime ������ ����
    }

    // try count , success count UI�� �����ֱ�
    public ShowData(tryCnt: number = 0, sucCnt: number = 0): void {
        this.userTryCnt = this.NumberSetting(this.userTryCnt, tryCnt, this.tryTxt);
        this.userSuccessCnt = this.NumberSetting(this.userSuccessCnt, sucCnt, this.sucTxt);
        console.log(`show data! recieve tryCnt is ${tryCnt} , result tryCnt is ${this.userTryCnt}`);
    }

    // ����� playerData ����
    public SaveData() {
        const data = new RoomData();
        data.Add("playerDeadCount", this.userTryCnt);
        data.Add("playerSuccessCount", this.userSuccessCnt);
        this.room?.Send("SavePlayerData", data.GetObject());
        console.log(`data saved! deadCount : ${this.userTryCnt}, sucCount : ${this.userSuccessCnt}`);
    }

    // count�� 9999�� ����, �Ѿ��� 9999+�� ǥ��ǵ��� ����
    private NumberSetting(resultCount: number, receiveCount: number, text: TextMeshProUGUI): number {

        let newResultCount: number;

        if (resultCount < 9999) {
            newResultCount = resultCount + receiveCount;
            text.text = newResultCount.toString();
        }
        else {
            newResultCount = resultCount;
            text.text = `${resultCount}+`;
        }
        return newResultCount;
    }

    public UIReset() {
        this.timeTxt.text = "00:00";
        this.counting = false;
    }
}

interface PlayerData {
    playerDeadCount: number;
    playerSuccessCount: number;
}

export interface GameReport {
    playerUserId: string;
    playerLapTime: number;
}