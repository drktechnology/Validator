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
const Base_1 = require("./Base");
class default_1 extends Base_1.default {
    init() {
        this.model = this.getDBModel('Event');
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield this.model.getDBInstance().find({});
            return events;
        });
    }
    getLastBlockNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield this.model.findOne({}).sort({ blockNumber: -1 });
            if (event) {
                console.log('xxx event', event);
                return event.blockNumber;
            }
            return 0;
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=EventService.js.map