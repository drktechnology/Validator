import Base from './Base'
import {Document} from 'mongoose'
import {validate} from '../utility'
import * as faucet from '../faucet'

export default class extends Base {

    public async getTestList(): Promise<Document[]>{
        const db_test = this.getDBModel('Test')
        return await db_test.find({})
    }

    public async claimFaucet(param) {
        const {to, ip} = param
        const amount = 3
        if (!validate.eth_address(to)) {
            throw 'Invalid address!'
        }
        const txHash = await faucet.transfer(to, amount)
        const doc = {
            ip,
            to,
            amount,
            txHash
        }
        const db_faucet = this.getDBModel('Faucet')
        const rs = await db_faucet.save(doc)
        return rs
    }

    public async listFaucet(param) {
        const limit = 10
        const db_faucet = this.getDBModel('Faucet').getDBInstance()
        const count = await db_faucet.count({})
        const list = await db_faucet.find({})
            .sort({createdAt: -1})
            .limit(limit)
        const rs = await db_faucet.aggregate([{ $match: {
        } },
        { $group: { _id : null, sum : { $sum: "$amount" } } }]);

        const sum = rs && rs[0] && rs[0].sum ? rs[0].sum : 0
        return {
            list,
            count,
            sum
        }
    }
}