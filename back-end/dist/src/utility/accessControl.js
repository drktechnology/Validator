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
const db_1 = require("../db");
const _ = require("lodash");
const protectRoles = (prefix, app, permissions) => {
    _.each(permissions, permission => {
        const { httpMethod, url } = permission;
        app[httpMethod](prefix + url, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
            const DB = yield db_1.default.create();
            const user = _.get(req, 'session.user');
            if (!user)
                return next();
            const userRole = _.get(user, 'role');
            try {
                const permissionRole = yield DB.getModel('Permission_Role').findOne({
                    url,
                    httpMethod,
                    role: userRole,
                });
                req['isAccessAllowed'] = _.get(permissionRole, 'isAllowed', false);
                if (userRole === 'SUPER_ADMIN') {
                    req['isAccessAllowed'] = true;
                }
            }
            catch (err) {
                console.log('err happened: ', err);
            }
            next();
        }));
    });
};
function checkRoleAuthorization(req, res, next) {
    const isAccessAllowed = _.get(req, 'isAccessAllowed');
    if (_.has(req, 'isAccessAllowed') && !isAccessAllowed) {
        return next('401 Unhautorized');
    }
    next();
}
exports.default = (prefix, app, permissions) => __awaiter(void 0, void 0, void 0, function* () {
    if (!prefix || typeof prefix != 'string')
        prefix = '';
    protectRoles(prefix, app, permissions);
    app.use(prefix + '*', checkRoleAuthorization);
});
//# sourceMappingURL=accessControl.js.map