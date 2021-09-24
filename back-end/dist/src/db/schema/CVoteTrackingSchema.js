"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CVote_Tracking = void 0;
const mongoose_1 = require("mongoose");
const _ = require("lodash");
const constant_1 = require("../../constant");
const CommentSchema = {
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
    },
    content: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
};
exports.CVote_Tracking = {
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: _.values(constant_1.constant.CVOTE_TRACKING_STATUS)
    },
    comment: CommentSchema,
    proposalId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'cvote'
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users'
    },
};
//# sourceMappingURL=CVoteTrackingSchema.js.map