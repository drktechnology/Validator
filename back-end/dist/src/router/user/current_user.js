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
    action() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.session.user) {
                const userService = this.buildService(UserService_1.default);
                const rs = yield userService.show({ userId: this.session.user._id });
                return this.result(1, rs);
            }
            else {
                return this.result(-1, 'no session');
            }
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=current_user.js.map