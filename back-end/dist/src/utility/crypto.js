"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hmacSha512 = require("crypto-js/hmac-sha512");
const aes = require("crypto-js/aes");
const utf8 = require("crypto-js/enc-utf8");
const crypto = require("crypto");
const secret = process.env.APP_SECRET || 'app';
exports.default = {
    sha512(str) {
        return hmacSha512(str, secret).toString();
    },
    sha256(str, secret) {
        const localSecret = secret || process.env.SSO_SECRET || 'SSO_SECRET';
        const hmac = crypto.createHmac('sha256', localSecret);
        hmac.update(str);
        return hmac.digest('hex');
    },
    encrypt(str) {
        return aes.encrypt(aes.encrypt(str, secret).toString(), secret + '_x').toString();
    },
    decrypt(str) {
        return aes.decrypt(aes.decrypt(str, secret + '_x').toString(utf8), secret).toString(utf8);
    },
    randomHexStr(numBytes) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield crypto.randomBytes(numBytes);
            return buffer.toString('hex');
        });
    }
};
//# sourceMappingURL=crypto.js.map