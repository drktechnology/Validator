"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLeader = exports.isAdmin = exports.isSecretary = exports.isCouncil = exports.checkPermissions = exports.getPermissionIndex = void 0;
const constant_1 = require("../constant/constant");
const SUPER_ADMIN = 'SUPER_ADMIN';
exports.getPermissionIndex = (role) => [
    constant_1.USER_ROLE.MEMBER,
    constant_1.USER_ROLE.LEADER,
    constant_1.USER_ROLE.ADMIN,
    constant_1.USER_ROLE.SECRETARY,
    constant_1.USER_ROLE.COUNCIL,
    SUPER_ADMIN,
].indexOf(role);
exports.checkPermissions = (userRole, role) => exports.getPermissionIndex(userRole) >= exports.getPermissionIndex(role);
exports.isCouncil = (userRole) => userRole === constant_1.USER_ROLE.COUNCIL;
exports.isSecretary = (userRole) => userRole === constant_1.USER_ROLE.SECRETARY;
exports.isAdmin = (userRole) => userRole === constant_1.USER_ROLE.ADMIN || userRole === SUPER_ADMIN;
exports.isLeader = (userRole) => userRole === constant_1.USER_ROLE.LEADER;
//# sourceMappingURL=permissions.js.map