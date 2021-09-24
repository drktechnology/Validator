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
const _ = require("lodash");
class default_1 extends Base_1.default {
    init() {
        this.model = this.getDBModel('Release');
    }
    create(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, desc } = param;
            const doc = {
                title,
                desc,
                createdBy: _.get(this.currentUser, '_id'),
            };
            const result = yield this.model.save(doc);
            return result;
        });
    }
    update(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, title, desc } = param;
            const doc = {
                title,
                desc,
            };
            yield this.model.update({ _id: id }, { $set: doc });
            return yield this.show({ id });
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.model.getDBInstance().find().sort({ createdAt: -1 });
            const total = list.length;
            return {
                list,
                total,
            };
        });
    }
    show(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: _id } = param;
            const doc = yield this.model.getDBInstance()
                .findById(_id);
            return doc;
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=ReleaseService.js.map