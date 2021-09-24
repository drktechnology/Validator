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
class default_1 extends Base_1.default {
    constructor() {
        super(...arguments);
        this.needLogin = false;
    }
    action() {
        return __awaiter(this, void 0, void 0, function* () {
            const userIds = this.getParam('userIds');
            if (userIds) {
                return yield this.show(userIds);
            }
            else {
                return yield this.listUser(this.getParam());
            }
        });
    }
    show(userIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const userService = this.buildService(UserService_1.default);
            const arrayIds = this.getUserIds(userIds);
            const users = yield userService.findUsers({
                userIds: arrayIds
            });
            return this.result(1, users);
        });
    }
    listUser(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const userService = this.buildService(UserService_1.default);
            const users = yield userService.findAll(query);
            return this.result(1, users);
        });
    }
    getUserIds(userIds) {
        let rs = [];
        if (userIds) {
            rs = userIds.split(',');
        }
        return rs;
    }
}
exports.default = default_1;
//# sourceMappingURL=list_users.js.map