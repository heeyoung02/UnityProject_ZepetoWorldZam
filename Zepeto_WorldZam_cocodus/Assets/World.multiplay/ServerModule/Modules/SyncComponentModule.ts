import { SandboxPlayer } from "ZEPETO.Multiplay";
import { IModule } from "../IModule";
import { sVector3, sQuaternion, SyncTransform, PlayerAdditionalValue, ZepetoAnimationParam } from "ZEPETO.Multiplay.Schema";
import { DataStorage, loadDataStorage } from "ZEPETO.Multiplay.DataStorage";

export default class SyncComponentModule extends IModule {
    private sessionIdQueue: string[] = [];
    private instantiateObjCaches: InstantiateObj[] = [];
    private masterClient: Function = (): SandboxPlayer | undefined => this.server.loadPlayer(this.sessionIdQueue[0]);

    async OnCreate() {
        /**Zepeto Player Sync**/
        this.server.onMessage(MESSAGE.SyncPlayer, (client, message) => {
            const player = this.server.state.players.get(client.sessionId);
            if (player) {
                const animationParam = new ZepetoAnimationParam();
                player.animationParam = Object.assign(animationParam, message.animationParam);
                player.gestureName = message.gestureName ?? null;

                if (message.playerAdditionalValue) {
                    const pAdditionalValue = new PlayerAdditionalValue();
                    player.playerAdditionalValue = Object.assign(pAdditionalValue, message.playerAdditionalValue);
                }
            }
        });

        /**Transform Sync**/
        this.server.onMessage(MESSAGE.SyncTransform, (client, message) => {
            const { Id, position, localPosition, rotation, scale, sendTime } = message;
            let syncTransform = this.server.state.SyncTransforms.get(Id.toString());

            if (!syncTransform) {
                syncTransform = new SyncTransform();
                this.server.state.SyncTransforms.set(Id.toString(), syncTransform);
            }

            Object.assign(syncTransform.position, position);
            Object.assign(syncTransform.localPosition, localPosition);
            Object.assign(syncTransform.rotation, rotation);
            Object.assign(syncTransform.scale, scale);
            syncTransform.sendTime = sendTime;
        });

        this.server.onMessage(MESSAGE.SyncTransformStatus, (client, message) => {
            const syncTransform = this.server.state.SyncTransforms.get(message.Id);
            if (syncTransform !== undefined) {
                syncTransform.status = message.Status;
            }
        });

        /** Sync Animaotr **/
        this.server.onMessage(MESSAGE.SyncAnimator, (client, message) => {
            const animator: SyncAnimator = {
                Id: message.Id,
                clipNameHash: message.clipNameHash,
                clipNormalizedTime: message.clipNormalizedTime,
            };
            const masterClient = this.masterClient();
            if (masterClient !== null && masterClient !== undefined) {
                this.server.broadcast(MESSAGE.ResponseAnimator + message.Id, animator, { except: masterClient });
            }
        });

        /** SyncTransform Util **/
        this.server.onMessage(MESSAGE.ChangeOwner, (client, message: string) => {
            this.server.broadcast(MESSAGE.ChangeOwner + message, client.sessionId);
        });
        this.server.onMessage(MESSAGE.Instantiate, (client, message: InstantiateObj) => {
            const InstantiateObj: InstantiateObj = {
                Id: message.Id,
                prefabName: message.prefabName,
                ownerSessionId: message.ownerSessionId,
                spawnPosition: message.spawnPosition,
                spawnRotation: message.spawnRotation,
            };
            this.instantiateObjCaches.push(InstantiateObj);
            this.server.broadcast(MESSAGE.Instantiate, InstantiateObj);
        });

        this.server.onMessage(MESSAGE.RequestInstantiateCache, (client) => {
            for (const obj of this.instantiateObjCaches) {
                client.send(MESSAGE.Instantiate, obj);
            }
        });

        /**SyncDOTween**/
        this.server.onMessage(MESSAGE.SyncDOTween, (client, message: syncTween) => {
            const tween: syncTween = {
                Id: message.Id,
                position: message.position,
                nextIndex: message.nextIndex,
                loopCount: message.loopCount,
                sendTime: message.sendTime,
            };
            const masterClient = this.masterClient();
            if (masterClient !== null && masterClient !== undefined) {
                this.server.broadcast(MESSAGE.ResponsePosition + message.Id, tween, { except: masterClient });
            }
        });

        /**Common**/
        this.server.onMessage(MESSAGE.CheckServerTimeRequest, (client, message) => {
            let Timestamp = +new Date();
            client.send(MESSAGE.CheckServerTimeResponse, Timestamp);
        });
        this.server.onMessage(MESSAGE.CheckMaster, (client, message) => {
            console.log(`master->, ${this.sessionIdQueue[0]}`);
            this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
        });
        this.server.onMessage(MESSAGE.PauseUser, (client) => {
            if (this.sessionIdQueue.includes(client.sessionId)) {
                const pausePlayerIndex = this.sessionIdQueue.indexOf(client.sessionId);
                this.sessionIdQueue.splice(pausePlayerIndex, 1);

                if (pausePlayerIndex == 0) {
                    console.log(`master->, ${this.sessionIdQueue[0]}`);
                    this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
                }
            }
        });
        this.server.onMessage(MESSAGE.UnPauseUser, (client) => {
            if (!this.sessionIdQueue.includes(client.sessionId)) {
                this.sessionIdQueue.push(client.sessionId);
                this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
            }
        });

        /** Sample Code **/
        this.server.onMessage(MESSAGE.BlockEnter, (client, transformId: string) => {
            this.server.broadcast(MESSAGE.BlockEnter + transformId, client.sessionId);
        });
        this.server.onMessage(MESSAGE.BlockExit, (client, transformId: string) => {
            this.server.broadcast(MESSAGE.BlockExit + transformId, client.sessionId);
        });
        this.server.onMessage(MESSAGE.SendBlockEnterCache, (client, blockCache) => {
            this.server.loadPlayer(blockCache.newJoinSessionId)?.send(MESSAGE.BlockEnter + blockCache.transformId, client.sessionId);
        });

        this.server.onMessage(MESSAGE.CoinAcquired, (client, transformId: string) => {
            this.masterClient()?.send(MESSAGE.CoinAcquired + transformId, client.sessionId);
        });

        /** Racing Game
        let isStartGame:boolean = false;
        let startServerTime:number;
        this.server.onMessage(MESSAGE.StartRunningRequest, (client) => {
            if(!isStartGame) {
                isStartGame = true;
                startServerTime = +new Date();

                this.server.broadcast(MESSAGE.CountDownStart, startServerTime);
            }
        });
        this.server.onMessage(MESSAGE.FinishPlayer, (client,finishTime:number) => {
            let playerLapTime = (finishTime-startServerTime)/1000;
            console.log(`${client.sessionId}is enter! ${playerLapTime}`);
            const gameReport: GameReport = {
                playerUserId: client.userId,
                playerLapTime: playerLapTime,
            };
            this.server.broadcast(MESSAGE.ResponseGameReport, gameReport);
            if(isStartGame) {
                isStartGame = false;
                let gameEndTime:number = +new Date();
                this.server.broadcast(MESSAGE.FirstPlayerGetIn, gameEndTime);
            }
        });**/

        /** labTime **/
        this.server.onMessage(MESSAGE.StartRunningRequest, (client) => {
            const startServerTime = +new Date();
            console.log(`start server time is : ${startServerTime}`);
            client.send(MESSAGE.CountDownStart, startServerTime);
        });
        this.server.onMessage(MESSAGE.FinishPlayer, (client, labTime: string) => {
            console.log(`${client.sessionId}is enter! ${labTime}`);
            const gameReport: GameReport = {
                playerUserId: client.userId,
                playerLapTime: parseFloat(labTime),
            };
            client.send(MESSAGE.ResponseGameReport, gameReport);

            this.labTimeSave(client, gameReport.playerUserId, gameReport.playerLapTime);
        });

        // 데이터관련 onMessage는 클라이언트가 보낸 메시지 타입을 처리할 콜백 등록임
        this.server.onMessage(MESSAGE.SavePlayerData, (client, message: PlayerData) => {
            const playerData: PlayerData = {
                playerDeadCount: message.playerDeadCount,
                playerSuccessCount: message.playerSuccessCount
            };
            this.savePlayerData(client, playerData);
        });

        // 나중에 리더보드만들때 필요할듯?
        this.server.onMessage(MESSAGE.LoadPlayerData, (client, userId: string) => {
            this.loadPlayerData(client, userId);
        });
    }

    // 플레이어 join시
    async OnJoin(client: SandboxPlayer) {
        if (!this.sessionIdQueue.includes(client.sessionId)) {
            this.sessionIdQueue.push(client.sessionId.toString());
        }
        // 클라이언트의 정보 저장 및 불러오기
        this.loadPlayerData(client, client.userId);
    }

    // 플레이어 leave시
    async OnLeave(client: SandboxPlayer) {
        if (this.sessionIdQueue.includes(client.sessionId)) {
            const leavePlayerIndex = this.sessionIdQueue.indexOf(client.sessionId);
            this.sessionIdQueue.splice(leavePlayerIndex, 1);
            if (leavePlayerIndex == 0) {
                console.log(`master->, ${this.sessionIdQueue[0]}`);
                this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
            }
        }
    }

    // 매시간마다..
    OnTick(deltaTime: number) {
    }


    /* save & load */
    async labTimeSave(client: SandboxPlayer, userId: string, labTime: number) {
        
        const labTimeStorage: DataStorage = await loadDataStorage(userId);
        const prevLabTimeData = await labTimeStorage.get<number>("LabTimeData");
        console.log(`lab time save! predata : [${prevLabTimeData}] , current data : [${labTime}]`);
        if (prevLabTimeData) {
            if (prevLabTimeData < labTime) // 기존에 저장된 labTime이 들어온 기록보다 낮다면
                return
            await labTimeStorage.set<number>("LabTimeData", labTime);
        }
        else// 저장된 데이터가 없었다면
            await labTimeStorage.set<number>("LabTimeData", labTime);
    }

    async savePlayerData(client: SandboxPlayer, playerData: PlayerData) {
        console.log(`save player data (${client.userId}) => Dead : ${playerData.playerDeadCount} , Success : ${playerData.playerSuccessCount}`);
        const playerStorage: DataStorage = client.loadDataStorage();
        const result = await playerStorage.set("PlayerData", playerData);
        // client.send는 특정 클라이언트에게 메시지 전송하기위한 함수
        client.send("SaveLog", `Save Result : ${result}`);
    }

    async loadPlayerData(client: SandboxPlayer, userId: string) {
        console.log(`load player data (${client.userId})`);
        const userStorage: DataStorage = await loadDataStorage(userId);
        const playerData = await userStorage.get<PlayerData>("PlayerData");
        const labTimeData = await userStorage.get<number>("LabTimeData");

        const welcomeGift = await userStorage.get<number>("WelcomeGift");

        // 도전,성공횟수 데이터
        if (playerData) {
            client.send("PlayerData", playerData);
        }
        else {
            const empty: PlayerData = {
                playerDeadCount: 0,
                playerSuccessCount: 0,
            }
            await userStorage.set("PlayerData", empty);
            client.send("PlayerData", empty);
        }

        // 랩타임 데이터
        if (labTimeData) {
            client.send("LabTimeData", labTimeData);
        }

        // 웰컴선물 데이터 받았으면 1, 안받았으면 0
        if (welcomeGift) {
            console.log(`i have welcomegift! [${welcomeGift}]`);
            client.send("WelcomeGift", welcomeGift);
        }
        else {
            console.log(`i dont have welcomegift!`);
            await userStorage.set("WelcomeGift", 1)
            client.send("WelcomeGift", 0);
        }
    }
}


interface syncTween {
    Id: string,
    position: sVector3,
    nextIndex: number,
    loopCount: number,
    sendTime: number,
}

interface SyncAnimator {
    Id: string,
    clipNameHash: number,
    clipNormalizedTime: number,
}

interface InstantiateObj {
    Id: string;
    prefabName: string;
    ownerSessionId?: string;
    spawnPosition?: sVector3;
    spawnRotation?: sQuaternion;
}

/** racing game **/
interface GameReport {
    playerUserId: string;
    playerLapTime: number;
}

/* player information */
interface PlayerData {
    playerDeadCount: number;
    playerSuccessCount: number;
}

enum MESSAGE {
    SyncPlayer = "SyncPlayer",
    SyncTransform = "SyncTransform",
    SyncTransformStatus = "SyncTransformStatus",
    SyncAnimator = "SyncAnimator",
    ResponseAnimator = "ResponseAnimator",
    ChangeOwner = "ChangeOwner",
    Instantiate = "Instantiate",
    RequestInstantiateCache = "RequestInstantiateCache",
    ResponsePosition = "ResponsePosition",
    SyncDOTween = "SyncDOTween",
    CheckServerTimeRequest = "CheckServerTimeRequest",
    CheckServerTimeResponse = "CheckServerTimeResponse",
    CheckMaster = "CheckMaster",
    MasterResponse = "MasterResponse",
    PauseUser = "PauseUser",
    UnPauseUser = "UnPauseUser",

    /** Sample Code **/
    BlockEnter = "BlockEnter",
    BlockExit = "BlockExit",
    SendBlockEnterCache = "SendBlockEnterCache",
    CoinAcquired = "CoinAcquired",

    /** Racing Game **/
    StartRunningRequest = "StartRunningRequest",
    FinishPlayer = "FinishPlayer",
    FirstPlayerGetIn = "FirstPlayerGetIn",
    CountDownStart = "CountDownStart",
    ResponseGameReport = "ResponseGameReport",

    // 데이터관련
    SavePlayerData = "SavePlayerData",
    LoadPlayerData = "LoadPlayerData",
}
