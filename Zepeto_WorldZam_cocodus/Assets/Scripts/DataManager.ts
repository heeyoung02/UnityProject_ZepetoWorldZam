import { TextMeshPro, TextMeshProUGUI } from 'TMPro';
import { GameObject, Object } from 'UnityEngine';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { LeaderboardAPI } from 'ZEPETO.Script.Leaderboard';
import { ZepetoWorldMultiplay } from 'ZEPETO.World'
import LeaderboardManager from '../Zepeto LeaderBoard Module/ZepetoScript/LeaderBoardManager';
import CoinManager from './Product/CoinManager';

export default class DataManager extends ZepetoScriptBehaviour {

    @SerializeField() private tryTxt: TextMeshProUGUI;
    @SerializeField() private sucTxt: TextMeshProUGUI;
    @SerializeField() private timeTxt: TextMeshProUGUI;
    @SerializeField() private bestTimeTxt: TextMeshProUGUI;
    @SerializeField() private alarmObj: GameObject;

    private multiplay: ZepetoWorldMultiplay;
    private room: Room;

    // 외부에서 읽기전용
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
            // 서버에서 loadPlayerData가 실행된 결과값 수신
            this.room.AddMessageHandler("PlayerData", (playerData: PlayerData) => {
                // 처음 룸에 입장했을때 client의 dataStorage에 등록된 값을 불러와서 서버에서 보내준 값
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

            this.room.AddMessageHandler("WelcomeGift", (num: number) => {
                console.log(`client welcome gift... [${num}]`);
                if (num == 0) // 웰컴선물 안받았으면
                {
                    this.alarmObj.SetActive(true);
                    CoinManager.instance.GiftCoin(500);
                }
                else // 웰컴선물 받았으면(1)
                    this.alarmObj.SetActive(false);
            });

            // 시작지점 트리거시 
            this.room.AddMessageHandler("CountDownStart", (startServerTime: number) => {
                this.counting = true;
                this.StartCoroutine(this.CountStart(startServerTime));
            });

            // 종료지점 트리거시
            this.room.AddMessageHandler("ResponseGameReport", (gameReport: GameReport) => {
                this.StopAllCoroutines();
                this.GameReport(gameReport.playerUserId, gameReport.playerLapTime);
                LeaderboardManager.instance.SendScore(gameReport.playerLapTime * 100);
                console.log(`leaderboard admit : [${gameReport.playerLapTime * 100}]`);
            });
        }
    }

    private GameReport(playerUserId: string, playerLapTime: number) {
        console.log(`Game Report - playerUserId is [${playerUserId}] , playerLapTime is [${playerLapTime}]`);
        let bestLapTime = parseFloat(this.bestTimeTxt.text); // 유저 최고기록(처음이면 0)
        if (playerLapTime < bestLapTime || bestLapTime == 0)
            this.bestTimeTxt.text = playerLapTime.toString();
    }

    private *CountStart(startTime: number) {
        const _startTime = startTime / 1000
        let elapsedTime: number = 0;

        while (this.counting) {
            // 현재 시간 갱신
            const endTime = +new Date();

            // 경과 시간 계산
            elapsedTime = (endTime / 1000) - _startTime;

            const textTime = elapsedTime.toFixed(2); // 흐른 시간을 00.00으로 자르고 string으로 형변환
            this.timeTxt.text = textTime;

            // 0.01초 대기
            yield new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    public CountEnd() {
        this.counting = false;
        this.room.Send("FinishPlayer", this.timeTxt.text); // labtime 서버에 전송
    }

    // try count , success count UI로 보여주기
    public ShowData(tryCnt: number = 0, sucCnt: number = 0): void {
        this.userTryCnt = this.NumberSetting(this.userTryCnt, tryCnt, this.tryTxt);
        this.userSuccessCnt = this.NumberSetting(this.userSuccessCnt, sucCnt, this.sucTxt);
        console.log(`show data! recieve tryCnt is ${tryCnt} , result tryCnt is ${this.userTryCnt}`);
    }

    // 변경된 playerData 저장
    public SaveData() {
        const data = new RoomData();
        data.Add("playerDeadCount", this.userTryCnt);
        data.Add("playerSuccessCount", this.userSuccessCnt);
        this.room.Send("SavePlayerData", data.GetObject());
        console.log(`data saved! deadCount : ${this.userTryCnt}, sucCount : ${this.userSuccessCnt}`);
    }

    // count값 9999로 제한, 넘어갈경우 9999+로 표기되도록 설정
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