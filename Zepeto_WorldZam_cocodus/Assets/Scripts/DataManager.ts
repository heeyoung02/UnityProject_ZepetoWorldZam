import { TextMeshPro, TextMeshProUGUI } from 'TMPro';
import { GameObject, Object } from 'UnityEngine';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World'
import PlayerSync from '../Multi/Player/PlayerSync';

export default class DataManager extends ZepetoScriptBehaviour {

    public tryTxt: TextMeshProUGUI;
    public sucTxt: TextMeshProUGUI;

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
            })
        }
    }

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
        this.room?.Send("SavePlayerData", data.GetObject());
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
}

interface PlayerData {
    playerDeadCount: number;
    playerSuccessCount: number;
}