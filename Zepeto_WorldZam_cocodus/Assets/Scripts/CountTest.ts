import { Room } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import { Object } from 'UnityEngine';
import MultiplayManager from '../Multi/MultiplayManager';

export default class CountTest extends ZepetoScriptBehaviour {

    private multiplay: ZepetoWorldMultiplay;
    private room: Room;

    private finish: bool = false;

    Start() {    
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.multiplay.RoomJoined += (room: Room) => {
            this.room = room;

            this.room.AddMessageHandler("CountDownStart", (startServerTime: number) => {
                this.StartGame(startServerTime);
                this.StartCoroutine(this.CountStart(startServerTime));
            });
            this.room.AddMessageHandler("FirstPlayerGetIn", (endServerTime: number) => {
                this.FinishGame(endServerTime);
            });

            this.room.AddMessageHandler("ResponseGameReport", (gameReport: GameReport) => {
                this.GameReport(gameReport.playerUserId, gameReport.playerLapTime);
            });
        };
    }

    private *CountStart(startTime: number) {
        const _startTime = startTime / 1000
        let currentTime: number;
        let elapsedTime: number = 0;

        while (!this.finish) {
            // 현재 시간 갱신
            currentTime = (+new Date()) / 1000;

            // 경과 시간 계산
            elapsedTime = currentTime - _startTime;

            // 경과 시간 콘솔 출력
            console.log(elapsedTime.toFixed(2));

            // 0.01초 대기
            //yield new Promise(resolve => setTimeout(resolve, 10));
            yield null;
        }
    }

    private StartGame(startServerTime: number) {
        console.log(`count down start! start server time is : ${startServerTime / 1000}`);
        // 1677766296723 
    }

    private FinishGame(endServerTime: number) {
        console.log(`count down finish! end server time is : ${endServerTime / 1000}`);
        // count down finish! end server time is : 1677766306640

        this.finish = true;
    }

    private GameReport(playerUserId: string, playerLapTime: number) {
        console.log(`Game Report - playerUserId is [${playerUserId}] , playerLapTime is [${playerLapTime}]`);
        // Game Report - playerUserId is [63df6f6f41f0eec3be433ef0] , playerLapTime is [9.867]
    }
}

export interface GameReport {
    playerUserId: string;
    playerLapTime: number;
}