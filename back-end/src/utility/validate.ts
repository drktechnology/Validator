import * as _ from 'lodash'
import * as validator from 'validator'
import * as WAValidator from 'wallet-address-validator';

const F = {
    email(email){
        return validator.isEmail(email)
    },

    valid_string(str, min, max=32768){
        if(!str || !_.isString(str)) return false
        const len = str.length
        if(len < min) return false
        if(len > max) return false

        return true
    },
    eth_address(address) {
        // console.log('xxx address', address)
        const valid = WAValidator.validate(address, 'ETH');
        return valid
    },
}

export default F
