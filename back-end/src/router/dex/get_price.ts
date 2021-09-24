import Base from '../Base'
import ValidatorService from '../../service/ValidatorService'
import {getPrice} from '../../contract'

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
        return this.rawResult(1, {
            "draken": {
                "usd": drkUsd
            }
        })
    }
}
