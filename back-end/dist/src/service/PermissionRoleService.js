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
        this.model = this.getDBModel('Permission_Role');
    }
    create(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = _.pick(param, ['role', 'resourceType', 'permissionId', 'isAllowed', 'httpMethod', 'url']);
            const existedDoc = yield this.model.findOne(_.pick(param, ['role', 'resourceType', 'permissionId', 'httpMethod', 'url']));
            if (existedDoc)
                return existedDoc;
            return yield this.model.save(doc);
        });
    }
    list(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = _.omit(param, ['results', 'page', 'sortBy', 'sortOrder', 'filter', 'profileListFor', 'search']);
            const cursor = this.model.getDBInstance()
                .find(query);
            const totalCursor = this.model.getDBInstance().find(query).count();
            const list = yield cursor;
            const total = yield totalCursor;
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
    update(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: _id } = param;
            const updateObject = _.pick(param, ['role', 'resourceType', 'permissionId', 'isAllowed', 'httpMethod', 'url']);
            if (_id !== 'undefined') {
                yield this.model.findOneAndUpdate({ _id }, updateObject);
                return this.model.findById(_id);
            }
            else {
                return this.create(param);
            }
        });
    }
    delete(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: _id } = param;
            return this.model.findByIdAndDelete(_id);
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=PermissionRoleService.js.map