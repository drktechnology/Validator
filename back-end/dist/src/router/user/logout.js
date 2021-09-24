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
const utility_1 = require("../../utility");
class Logout extends Base_1.default {
    action() {
        return __awaiter(this, void 0, void 0, function* () {
            const destroySession = () => {
                return new Promise((resolve, reject) => {
                    this.session.destroy((err) => {
                        if (err) {
                            utility_1.logger.error(err);
                            reject(false);
                        }
                        resolve(true);
                    });
                });
            };
            const rs = yield destroySession();
            return this.result(1, rs);
        });
    }
}
exports.default = Logout;
//# sourceMappingURL=logout.js.map