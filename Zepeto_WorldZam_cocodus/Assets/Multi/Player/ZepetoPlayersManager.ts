import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {WorldService, ZepetoWorldMultiplay, Content, OfficialContentType, ZepetoWorldContent} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import {SpawnInfo, ZepetoPlayers} from 'ZEPETO.Character.Controller';
import {State, Player} from "ZEPETO.Multiplay.Schema";
import { Camera, GameObject, Object, Quaternion, Transform, WaitForSeconds} from "UnityEngine";
import PlayerSync from './PlayerSync';
import TransformSyncHelper, { PositionExtrapolationType, PositionInterpolationType } from '../TransformSyncHelper';

export enum ZepetoPlayerSpawnType {
    NoneSpawn,//Do not create players (플레이어 생성 x)
    SinglePlayerSpawnOnStart,//Single zepeto player created at start (단일 플레이어)
    MultiplayerSpawnOnJoinRoom,// Creates a multi-zepeto player when connected to a server (Default) (멀티-기본)
    MultiplayerSpawnLater,// When you calling "ZepetoPlayers.instance.CreatePlayerWithUserId()" to another script (다른 스크립트에 "ZepetoPlayers.instance.CreatePlayerWithUserId()"를 호출할 때)
}
export default class ZepetoPlayersManager extends ZepetoScriptBehaviour {

    /** Options **/
    @Header("SpawnOption")
    public readonly ZepetoPlayerSpawnType : ZepetoPlayerSpawnType = ZepetoPlayerSpawnType.MultiplayerSpawnOnJoinRoom;

    @Header("Position")
    public readonly UseHardSnap: boolean = true;
    @Tooltip("Force the position to be modified if it is farther than this number.") @SerializeField() private readonly HardSnapIfDistanceGreaterThan: number = 10;
    public readonly InterpolationType: PositionInterpolationType = PositionInterpolationType.MoveToward;
    public readonly ExtrapolationType: PositionExtrapolationType = PositionExtrapolationType.Disable;
    @Tooltip("The creditworthiness of the offset figure of the extrapolation.") @SerializeField() private readonly extraMultipler: number = 1;
    @Header("Gesture Sync")
    public readonly GetAnimationClipFromResources: boolean = true; // You can synchronize gestures within a resource folder. (리소스 폴더 내에서 제스처를 동기화할 수 있음)
    public readonly UseZepetoGestureAPI: boolean = false; // Synchronize the Zepeto World Gesture API animation. (Zepeto World Gesture API 애니메이션 동기화)

    private multiplay: ZepetoWorldMultiplay;
    private room: Room;
    private currentPlayers: Map<string, Player> = new Map<string, Player>();

    // spawn point
    @SerializeField() private spawnPoint: Transform;

    
    /* Singleton */
    private static m_instance: ZepetoPlayersManager = null;
    public static get instance(): ZepetoPlayersManager {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<ZepetoPlayersManager>();
            if (this.m_instance === null) {
                this.m_instance = new GameObject(ZepetoPlayersManager.name).AddComponent<ZepetoPlayersManager>();
            }
        }
        return this.m_instance;
    }
    private Awake() {
        if (ZepetoPlayersManager.m_instance !== null && ZepetoPlayersManager.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            ZepetoPlayersManager.m_instance = this;
            GameObject.DontDestroyOnLoad(this.gameObject);
        }
    }

    private Start() {

        switch (+this.ZepetoPlayerSpawnType){
            case ZepetoPlayerSpawnType.NoneSpawn:
                break;
            case ZepetoPlayerSpawnType.SinglePlayerSpawnOnStart:
                this.CreateSinglePlayer();
                break;
            case ZepetoPlayerSpawnType.MultiplayerSpawnOnJoinRoom:
            case ZepetoPlayerSpawnType.MultiplayerSpawnLater:
                this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
                this.multiplay.RoomJoined += (room: Room) => {
                    this.room = room;
                    this.room.OnStateChange += this.OnStateChange;
                }
                ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                    this.AddPlayerSync(sessionId);
                });
                if(this.UseZepetoGestureAPI) {
                    this.ContentRequest();
                }
                break;
        }
    }
    
    /** singleplayer Spawn **/
    private CreateSinglePlayer(){
        ZepetoPlayers.instance.CreatePlayerWithUserId(WorldService.userId,new SpawnInfo(), true);
    }
    
    /** multiplayer Spawn **/
    private OnStateChange(state: State, isFirst: boolean) {
        const join = new Map<string, Player>();
        const leave = new Map<string, Player>(this.currentPlayers);

        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
            leave.delete(sessionId);
        });

        // [RoomState] Create a player instance for players that enter the Room
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // [RoomState] Remove the player instance for players that exit the room
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
    }
    
    private AddPlayerSync(sessionId:string){
        const isLocal:boolean = this.room.SessionId === sessionId;
        const player: Player = this.currentPlayers.get(sessionId);
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        
        const tfHelper = zepetoPlayer.character.transform.gameObject.AddComponent<TransformSyncHelper>();
        tfHelper.Id = sessionId;
        tfHelper.UseHardSnap = this.UseHardSnap;
        tfHelper.HardSnapIfDistanceGreaterThan= this.HardSnapIfDistanceGreaterThan;
        tfHelper.InterpolationType = this.InterpolationType;
        tfHelper.ExtrapolationType = this.ExtrapolationType;
        tfHelper.extraMultipler = this.extraMultipler;
        tfHelper.ChangeOwner(sessionId);

        const playerStateSync = zepetoPlayer.character.transform.gameObject.AddComponent<PlayerSync>();
        playerStateSync.isLocal = isLocal;
        playerStateSync.player = player;
        playerStateSync.zepetoPlayer = zepetoPlayer;
        playerStateSync.GetAnimationClipFromResources = this.GetAnimationClipFromResources;
        playerStateSync.UseZepetoGestureAPI = this.UseZepetoGestureAPI;
        playerStateSync.tfHelper = tfHelper;

        const isUseInjectSpeed:boolean = this.InterpolationType == PositionInterpolationType.MoveToward 
            || this.InterpolationType == PositionInterpolationType.Lerp 
            || this.ExtrapolationType == PositionExtrapolationType.FixedSpeed;
        
        if(isUseInjectSpeed) {
            playerStateSync.isUseInjectSpeed= true;
        }

        //const playerDataManager = zepetoPlayer.character.transform.gameObject.AddComponent<DataManager>();
    }
    
    public GestureAPIContents:Map<string,Content> =  new Map<string, Content>();
    private ContentRequest() {
        //Gesture Type Request
        ZepetoWorldContent.RequestOfficialContentList(OfficialContentType.All, contents => {
            for(let i=0; i<contents.length; i++) {
                this.GestureAPIContents.set(contents[i].Id, contents[i]);
            }
        });
    }
    
    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);
        this.currentPlayers.set(sessionId, player);
        
        if(this.ZepetoPlayerSpawnType == ZepetoPlayerSpawnType.MultiplayerSpawnOnJoinRoom) {
            const spawnInfo = new SpawnInfo();
            spawnInfo.position = this.transform.position;
            spawnInfo.rotation = this.transform.rotation;
            const isLocal = this.room.SessionId === player.sessionId;
            ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
        }
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        this.currentPlayers.delete(sessionId);
        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }
    
    
    /** MultiplayerSpawnLater SampleCode */
    /** Creates all players who have entered a room that has not yet been created. 
     * When MultiplayerSpawnLater option, call and use it at the desired time.*/
    public CreateAllPlayers(){
        const spawnInfo = new SpawnInfo();
        spawnInfo.position = this.transform.position;
        spawnInfo.rotation = this.transform.rotation;
        this.currentPlayers.forEach((player:Player)=> {
            const isLocal = this.room.SessionId === player.sessionId;
            if(!ZepetoPlayers.instance.HasPlayer(player.sessionId)) {
                console.log(`Spawn ${player.sessionId}`);
                ZepetoPlayers.instance.CreatePlayerWithUserId(player.sessionId, player.zepetoUserId, spawnInfo, isLocal);
            }
        });
    }

    /** This is a sample code that creates my character in the
     * MultiplayerSpawnLater option and generates other users who were on the server after 10 seconds of play.*/
    private * WaitTutorial(){
        const spawnInfo = new SpawnInfo();
        spawnInfo.position = this.transform.position;
        spawnInfo.rotation = this.transform.rotation;
        ZepetoPlayers.instance.CreatePlayerWithUserId(this.room.SessionId, WorldService.userId, spawnInfo, true);
        
        yield new WaitForSeconds(10);
        this.CreateAllPlayers();
    }

    // 스폰 포인트로 이동 & 카메라 정면으로 돌리기
    public MoveSpawnPoint() {
        const localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        localCharacter.Teleport(this.spawnPoint.position, Quaternion.identity);
        this.GetComponentInChildren<Camera>().transform.parent.rotation = Quaternion.identity;
    }

}
