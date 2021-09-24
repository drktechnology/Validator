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
const CommunityService_1 = require("../../service/CommunityService");
const constant_1 = require("../../constant");
class default_1 extends Base_1.default {
    constructor() {
        super(...arguments);
        this.needLogin = false;
    }
    action() {
        return __awaiter(this, void 0, void 0, function* () {
            const communityId = this.getParam('communityId');
            if (!communityId) {
                return yield this.index();
            }
            return yield this.show(communityId);
        });
    }
    show(communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const communityService = this.buildService(CommunityService_1.default);
            const rs = yield communityService.get(communityId);
            return this.result(1, rs);
        });
    }
    index() {
        return __awaiter(this, void 0, void 0, function* () {
            const communityService = this.buildService(CommunityService_1.default);
            const rs = yield communityService.index({
                query: {
                    type: constant_1.constant.COMMUNITY_TYPE.COUNTRY
                }
            });
            return this.result(1, rs);
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=get.js.map