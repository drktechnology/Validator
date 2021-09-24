"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("./crypto");
const querystring = require("querystring");
const sso = {
    validate(payload, sig) {
        const str = querystring.unescape(payload);
        return crypto_1.default.sha256(str) === sig ? true : false;
    },
    getNonce(payload) {
        const q = querystring.parse(new Buffer(querystring.unescape(payload), 'base64').toString());
        if ('nonce' in q) {
            return q['nonce'];
        }
        else {
            throw new Error('Missing Nonce in payload!');
        }
    },
    buildLoginString(params) {
        if (!('external_id' in params)) {
            throw new Error('Missing required parameter: external_id');
        }
        if (!('nonce' in params)) {
            throw new Error('Missing required parameter: nonce');
        }
        if (!('email' in params)) {
            throw new Error('Missing required parameter: email');
        }
        const payload = new Buffer(querystring.stringify(params), 'utf8').toString('base64');
        return querystring.stringify({
            'sso': payload,
            'sig': crypto_1.default.sha256(payload)
        });
    }
};
exports.default = sso;
//# sourceMappingURL=sso.js.map