import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Text, Button, InputField, Slider } from 'UnityEngine.UI'
import { Object, WaitForSeconds, WaitUntil } from 'UnityEngine'
import { InventoryService } from "ZEPETO.Inventory";
import { BalanceListResponse, CurrencyService, CurrencyError } from "ZEPETO.Currency";
import { ProductRecord, ProductService } from "ZEPETO.Product";
import { ZepetoWorldMultiplay } from "ZEPETO.World";
import { RoomData, Room } from "ZEPETO.Multiplay";

export default class Product_UI_Balance extends ZepetoScriptBehaviour {
    @SerializeField() private magicCoinTxt: Text;
    @SerializeField() private zemTxt: Text;
    @SerializeField() private shop_zemTxt: Text;
    @SerializeField() private shop_MCTxt: Text;

    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room

    private Start() {
        this.RefreshAllBalanceUI();
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();

        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.InitMessageHandler();
        }
    }

    private InitMessageHandler() {
        this._room.AddMessageHandler<BalanceSync>("SyncBalances", (message) => {
            this.RefreshAllBalanceUI();
        });
        ProductService.OnPurchaseCompleted.AddListener((product, response) => {
            this.RefreshAllBalanceUI();
        });
    }

    private RefreshAllBalanceUI() {
        this.StartCoroutine(this.RefreshBalanceUI());
        this.StartCoroutine(this.RefreshOfficialCurrencyUI());
    }

    private *RefreshBalanceUI() {
        const request = CurrencyService.GetUserCurrencyBalancesAsync();
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.isSuccess) {
            this.magicCoinTxt.text = request.responseData.currencies?.ContainsKey(Currency.magicCoin) ? request.responseData.currencies?.get_Item(Currency.magicCoin).toString() : "0";
            this.shop_MCTxt.text = request.responseData.currencies?.ContainsKey(Currency.magicCoin) ? request.responseData.currencies?.get_Item(Currency.magicCoin).toString() : "0";
        }
    }

    private *RefreshOfficialCurrencyUI() {
        const request = CurrencyService.GetOfficialCurrencyBalanceAsync();
        yield new WaitUntil(() => request.keepWaiting == false);
        this.zemTxt.text = request.responseData.currency.quantity.toString();
        this.shop_zemTxt.text = request.responseData.currency.quantity.toString();
    }

}



export interface BalanceSync {
    currencyId: string,
    quantity: number,
}

export interface InventorySync {
    productId: string,
    inventoryAction: InventoryAction,
}

export enum InventoryAction {
    Removed = -1,
    Used,
    Added,
}

export enum Currency {
    magicCoin = "wizard_item_coin",
}
