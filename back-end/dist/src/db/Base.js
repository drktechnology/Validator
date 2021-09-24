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
const mongoose = require("mongoose");
const _ = require("lodash");
class default_1 {
    constructor(DB) {
        this.schema = this.buildSchema();
        this.db = DB.model(this.getName(), this.schema);
        this.reject_fields = _.extend({
            __v: false
        }, this.rejectFields());
    }
    buildSchema() {
        const schema = new mongoose.Schema(_.extend({
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        }, this.getSchema()), _.extend({
            timestamps: true
        }, this.getSchemaOption()));
        return schema;
    }
    getSchemaOption() {
        return {};
    }
    rejectFields() {
        return {};
    }
    save(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.create(doc);
        });
    }
    find(query, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const option = this.buildFindOptions(opts);
            const reject_fields = option.reject ? this.reject_fields : {};
            let res = yield this.db.find(query, reject_fields);
            return res;
        });
    }
    findById(id, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findOne({ _id: id }, opts);
        });
    }
    findOne(query, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const option = this.buildFindOptions(opts);
            const reject_fields = option.reject ? this.reject_fields : {};
            return yield this.db.findOne(query, reject_fields);
        });
    }
    findByIdAndDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.findByIdAndDelete(id);
        });
    }
    findOneAndDelete(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.findOneAndDelete(query);
        });
    }
    update(query, doc, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.update(query, doc, this.buildUpdateOptions(opts));
        });
    }
    findOneAndUpdate(query, doc, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.findOneAndUpdate(query, doc, opts);
        });
    }
    count(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.count(query);
        });
    }
    list(query, sort, limit, select) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.find(query).select(select || '').sort(sort || {}).limit(_.toNumber(limit) || 1000);
        });
    }
    getAggregate() {
        return this.db.aggregate();
    }
    getDBInstance() {
        return this.db;
    }
    remove(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.remove(query);
        });
    }
    buildUpdateOptions(opts) {
        return _.extend({
            multi: false
        }, opts || {});
    }
    buildFindOptions(opts) {
        return _.extend({
            reject: true
        }, opts || {});
    }
}
exports.default = default_1;
//# sourceMappingURL=Base.js.map