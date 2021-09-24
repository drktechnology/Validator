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
const Base_1 = require("../Base");
const UserService_1 = require("../../service/UserService");
const utility_1 = require("../../utility");
const moment = require("moment");
class default_1 extends Base_1.default {
    action() {
        return __awaiter(this, void 0, void 0, function* () {
            const userService = this.buildService(UserService_1.default);
            const { username, password } = this.getParam();
            userService.validate_username(username);
            userService.validate_password(password);
            const salt = yield userService.getUserSalt(username);
            const pwd = userService.getPassword(password, salt);
            const user = yield userService.findUser({
                username,
                password: pwd
            });
            if (!user) {
                throw 'username or password is incorrect';
            }
            const resultData = {
                user
            };
            userService.recordLogin({ userId: user.id });
            this.session.userId = user.id;
            resultData['api-token'] = utility_1.utilCrypto.encrypt(JSON.stringify({
                userId: user.id,
                expired: moment().add(30, 'd').unix()
            }));
            return this.result(1, resultData);
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=login.js.map