"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Elip = void 0;
const mongoose_1 = require("mongoose");
const _ = require("lodash");
const constant_1 = require("../../constant");
const CommentSchema_1 = require("./CommentSchema");
exports.Elip = {
    title: {
        type: String,
        required: true
    },
    vid: {
        type: Number,
        required: true
    },
    contentType: {
        type: String,
        enum: _.values(constant_1.constant.CONTENT_TYPE)
    },
    description: {
        type: String
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    status: {
        type: String,
        enum: _.values(constant_1.constant.ELIP_STATUS)
    },
    comments: [[CommentSchema_1.CommentSchema]]
};
//# sourceMappingURL=ElipSchema.js.map