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
exports.middleware = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const utility_1 = require("../utility");
const moment = require("moment");
const community_1 = require("./community");
const google_1 = require("./google");
const ping_1 = require("./ping");
const test_1 = require("./test");
const upload_1 = require("./upload");
const user_1 = require("./user");
const validator_1 = require("./validator");
const event_1 = require("./event");
const state_1 = require("./state");
const dex_1 = require("./dex");
exports.middleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers['api-token'];
    const DB = yield db_1.default.create();
    if (token) {
        const json = JSON.parse(utility_1.utilCrypto.decrypt(token.toString()));
        if (json.userId && json.expired && (json.expired - moment().unix() > 0)) {
            try {
                const user = yield DB.getModel('User').findOne({ _id: json.userId });
                delete user._doc.salt;
                if (user) {
                    req['session'].user = user;
                    req['session'].userId = user.id;
                }
            }
            catch (err) {
                console.log('err happened: ', err);
            }
        }
    }
    else if (req['session'].userId) {
        const session = req['session'];
        try {
            const user = yield DB.getModel('User').findOne({ _id: session.userId });
            if (user) {
                req['session'].user = user;
            }
        }
        catch (err) {
            console.log('err happened: ', err);
        }
    }
    next();
});
const router = express_1.Router();
router.use('/test', test_1.default);
router.use('/ping', ping_1.default);
router.use('/community', community_1.default);
router.use('/google', google_1.default);
router.use('/user', user_1.default);
router.use('/upload', upload_1.default);
router.use('/validator', validator_1.default);
router.use('/event', event_1.default);
router.use('/state', state_1.default);
router.use('/dex', dex_1.default);
router.use((req, res) => {
    return res.sendStatus(403);
});
exports.default = router;
//# sourceMappingURL=index.js.map