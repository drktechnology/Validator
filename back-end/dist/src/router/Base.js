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
const express_1 = require("express");
const _ = require("lodash");
const db_1 = require("../db");
const utility_1 = require("../utility");
class default_1 {
    constructor(req, res) {
        this.needLogin = false;
        this.req = req;
        this.res = res;
        this.session = req.session;
        this.init();
    }
    static setRouter(list) {
        const router = express_1.Router();
        _.each(list, (item) => {
            router[item.method](item.path, (req, res) => {
                const c = new item.router(req, res);
                return c.main();
            });
        });
        return router;
    }
    init() { }
    main() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!(yield this.validate())) {
                    return this.result(-1, { code: 401, message: 'Please login' });
                }
                this.db = yield db_1.default.create();
                const result = yield this.action();
                if (result) {
                    this.res.set('Content-Type', 'application/json');
                    this.res.json(result);
                }
            }
            catch (e) {
                utility_1.logger.error(e);
                this.res.json(this.result(-1, e));
            }
        });
    }
    validate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.needLogin) {
                if (!this.session.user) {
                    this.res.sendStatus(401);
                    return false;
                }
            }
            return true;
        });
    }
    result(code, dataOrError, msg) {
        const opts = {
            code,
            data: dataOrError,
            error: dataOrError,
            message: msg
        };
        if (opts.code > 0) {
            return {
                code: opts.code,
                data: opts.data,
                message: opts.message || 'ok'
            };
        }
        else {
            const err = opts.error;
            return {
                code: err['code'] ? -err['code'] : opts.code,
                type: err.name || '',
                error: err.message || err.toString()
            };
        }
    }
    rawResult(code, dataOrError, msg) {
        const opts = {
            code,
            data: dataOrError,
            error: dataOrError,
            message: msg
        };
        if (opts.code > 0) {
            return opts.data || 'ok';
        }
        else {
            const err = opts.error;
            return {
                code: err['code'] ? -err['code'] : opts.code,
                type: err.name || '',
                error: err.message || err.toString()
            };
        }
    }
    buildService(service) {
        return new service(this.db, this.session);
    }
    getParam(key) {
        const param = _.extend({}, this.req.query, this.req.body, this.req.params);
        return key ? _.get(param, key, '') : param;
    }
}
exports.default = default_1;
//# sourceMappingURL=Base.js.map