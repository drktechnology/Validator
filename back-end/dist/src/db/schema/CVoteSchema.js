"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CVote = exports.CVoteHistorySchema = exports.CVoteResultSchema = void 0;
const mongoose_1 = require("mongoose");
const _ = require("lodash");
const constant_1 = require("../../constant");
const SubscriberSchema_1 = require("./SubscriberSchema");
exports.CVoteResultSchema = {
    votedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    value: {
        type: String,
        emun: _.values(constant_1.constant.CVOTE_RESULT),
        default: constant_1.constant.CVOTE_RESULT.UNDECIDED
    },
    reason: {
        type: String,
        default: ''
    }
};
exports.CVoteHistorySchema = Object.assign(Object.assign({}, exports.CVoteResultSchema), { createdAt: {
        type: Date,
        required: true,
        default: Date.now
    } });
exports.CVote = {
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
    type: {
        type: String,
        enum: _.values(constant_1.constant.CVOTE_TYPE)
    },
    abstract: {
        type: String
    },
    goal: {
        type: String
    },
    motivation: {
        type: String
    },
    relevance: {
        type: String
    },
    budget: {
        type: String
    },
    plan: {
        type: String
    },
    proposedBy: {
        type: String,
        required: true
    },
    proposer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    motionId: {
        type: String
    },
    notes: {
        type: String
    },
    voteHistory: [exports.CVoteHistorySchema],
    voteResult: [exports.CVoteResultSchema],
    vote_map: Object,
    avatar_map: Object,
    reason_map: Object,
    reason_zh_map: Object,
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    published: {
        type: Boolean,
        default: false
    },
    proposedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: _.values(constant_1.constant.CVOTE_STATUS)
    },
    subscribers: [SubscriberSchema_1.SubscriberSchema],
    notified: {
        type: Boolean,
        default: false
    },
    reference: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'suggestion'
    }
};
//# sourceMappingURL=CVoteSchema.js.map