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
        this.needLogin = true;
    }
    action() {
        return __awaiter(this, void 0, void 0, function* () {
            const userService = this.buildService(UserService_1.default);
            yield userService.changePassword(this.getParam());
            return this.result(1, {});
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=change_password.js.map