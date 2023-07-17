import { GameObject, Object, Transform, Vector3 } from 'UnityEngine';
import { Text } from 'UnityEngine.UI';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import FallCheck from '../FallCheck';
import { InventoryAction, InventorySync } from './Product_UI_Balance';

export default class CoinManager extends ZepetoScriptBehaviour {

    /* Singleton */
    private static m_instance: CoinManager = null;
    public static get instance(): CoinManager {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<CoinManager>();
            if (this.m_instance === null) {
                this.m_instance = new GameObject(CoinManager.name).AddComponent<CoinManager>();
            }
        }
        return this.m_instance;
    }
    private Awake() {
        if (CoinManager.m_instance !== null && CoinManager.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            CoinManager.m_instance = this;
            GameObject.DontDestroyOnLoad(this.gameObject);
        }
    }

    private multiplay: ZepetoWorldMultiplay;
    private room: Room;
    private fallCheck: FallCheck;

    @SerializeField() private tempCoin: number = 0; // 임시코인
    @SerializeField() private tempCoinTxt: Text;
    @SerializeField() private informationPref: GameObject;
    @SerializeField() private spawnFlagItemPref: GameObject;
    @SerializeField() private invenPopupWindow: Transform;
    @SerializeField() private coinPrice: number = 10; // 코인 1개 먹을때마다 얻는 가격

    private useSpawnFlagItem: GameObject;
    private coinObjs: GameObject[] = [];

    private Start() {
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.fallCheck = Object.FindObjectOfType<FallCheck>();

        this.multiplay.RoomJoined += (room: Room) => {
            this.room = room;

            this.room.AddMessageHandler<InventorySync>("SyncInventories", (message) => {
                // item use
                if (message.inventoryAction == InventoryAction.Used) {
                    if (message.productId == PRODUCTS.magicCoin300) { // magicCoin300 사용시
                        this.OpenInformation(`You Got 300 Magic Coins!`);
                        this.GetCoin(300);
                    }
                    if (message.productId == PRODUCTS.spawnFlag) { // spawn flag 사용시
                        console.log("you are get spawnFlag");
                        this.SpawnFlagItemUse();
                    }
                }
            });
        }
    }

    // Retry버튼 클릭시 실행
    public FlagReset() {
        this.spawnItemUsing = false;
        this.PrevFlagHide();
    }

    public PrevFlagHide() {
        this.useSpawnFlagItem.SetActive(false);
    }

    private FlagObjActive(obj: GameObject, pos: Vector3) {
        if (obj == null) {
            const itemObj = GameObject.Instantiate(this.spawnFlagItemPref) as GameObject;
            this.useSpawnFlagItem = itemObj;
            itemObj.transform.position = pos;
        }
        else {
            obj.SetActive(true);
            obj.transform.position = pos;
        }
    }

    @HideInInspector() spawnItemUsing: boolean = false;
    private SpawnFlagItemUse() {
        this.spawnItemUsing = true;
        // 인벤토리 창 닫기
        this.invenPopupWindow.gameObject.SetActive(false);
        // 캐릭터 현재 위치로 스폰포인트 변경
        const localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform;
        this.fallCheck.SpawnItemUse(localCharacter.position);
        // 깃발 오브젝트 나타내기
        this.FlagObjActive(this.useSpawnFlagItem, localCharacter.position);
    }

    public AddCoin(): number {
        this.tempCoin += this.coinPrice;
        this.tempCoinTxt.text = this.tempCoin.toString();
        return this.tempCoin;
    }

    public PutCoinObj(obj: GameObject) {
        this.coinObjs.push(obj);
    }

    // 골라인 통과시 해당 함수 실행 (비활성화된 코인 다시 나타내고 배열 비우기)
    public CoinActive() {
        this.coinObjs.forEach(obj => {
            obj.SetActive(true);
        });
        this.coinObjs = [];

        // 획득 코인 서버에 전송, 메세지 띄우기
        this.GetCoin(this.tempCoin);
        this.OpenInformation(`You got ${this.tempCoin} Magic Coins!!`);

        // 임시코인 reset
        this.tempCoin = 0;
        this.tempCoinTxt.text = this.tempCoin.toString();
    }

    private GetCoin(amount: number) {
        const data = new RoomData();
        data.Add("currencyId", PRODUCTS.magicCoin);
        data.Add("quantity", amount);
        this.room.Send("onCredit", data.GetObject());
    }

    private OpenInformation(message: string) {
        const inforObj = GameObject.Instantiate(this.informationPref, this.transform.parent) as GameObject;
        inforObj.GetComponentInChildren<Text>().text = message;
    }

    public GiftCoin(amount: number) {
        const data = new RoomData();
        data.Add("currencyId", PRODUCTS.magicCoin);
        data.Add("quantity", amount);
        this.room.Send("onCredit", data.GetObject());
    }
}

enum PRODUCTS {
    magicCoin = "wizard_item_coin",
    magicCoin300 = "wizard_item_coin_100",
    spawnFlag = "wizard_item_flag",
}