"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionRole = exports.Permission = void 0;
const mongoose_1 = require("mongoose");
const constant_1 = require("../../constant");
const _ = require("lodash");
exports.Permission = {
    name: String,
    desc: String,
    resourceType: String,
    url: String,
    httpMethod: {
        type: String,
        enum: ['get', 'post', 'put', 'delete', 'patch']
    },
};
exports.PermissionRole = {
    resourceType: String,
    role: {
        type: String,
        enum: _.values(constant_1.constant.USER_ROLE)
    },
    permissionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'permission' },
    isAllowed: Boolean,
    url: String,
    httpMethod: {
        type: String,
        enum: ['get', 'post', 'put', 'delete', 'patch']
    }
};
//# sourceMappingURL=PermissionSchema.js.map