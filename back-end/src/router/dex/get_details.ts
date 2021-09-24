import Base from '../Base'
import {getPrice, getTotalStake, getTotalSupply} from '../../contract'

const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();

export default class extends Base {
    protected needLogin = false
    async action(){
        const drkEth = await getPrice()
        const rs = await CoinGeckoClient.simple.price({
            ids: ['ethereum'],
            vs_currencies: ['usd']
          })
        const ethUsd = rs.data ? rs.data.ethereum.usd : 0
        const drkUsd = drkEth * ethUsd

        const totalStake = await getTotalStake()

        const totalSupply = await getTotalSupply()

        const date = new Date();
        return this.rawResult(1, {
            "id": "draken",
            "symbol": "drk",
            "name": "draken",
            "block_time_in_minutes" : "3",
            "total_stake": totalStake,
            "market_data" : {
                "current_price": drkUsd,
                "total_supply": null,
                "circulating_supply": totalSupply - 9223372036,
                "last_updated": date.toISOString()
            }
        })
    }
}