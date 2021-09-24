"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Suggestion = void 0;
const mongoose_1 = require("mongoose");
const CommentSchema_1 = require("./CommentSchema");
const SubscriberSchema_1 = require("./SubscriberSchema");
const constant_1 = require("../../constant");
const _ = require("lodash");
const SuggestionCore = {
    title: {
        type: String
    },
    descUpdatedAt: Date,
    shortDesc: {
        type: String,
        maxLength: 255
    },
    desc: {
        type: String
    },
    benefits: {
        type: String
    },
    funding: {
        type: Number
    },
    timeline: {
        type: Date
    },
    link: [String],
    coverImg: String,
    type: {
        type: String,
        enum: _.values(constant_1.constant.SUGGESTION_TYPE)
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
    }
};
const tag = {
    type: {
        type: String,
        enum: _.values(constant_1.constant.SUGGESTION_TAG_TYPE),
        uppercase: true,
        required: true
    },
    desc: String,
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
};
exports.Suggestion = Object.assign(Object.assign({}, SuggestionCore), { contentType: {
        type: String,
        enum: _.values(constant_1.constant.CONTENT_TYPE)
    }, editHistory: [], likes: {
        type: [mongoose_1.Schema.Types.ObjectId],
        default: []
    }, likesNum: {
        type: Number,
        default: 0
    }, dislikes: {
        type: [mongoose_1.Schema.Types.ObjectId],
        default: []
    }, dislikesNum: {
        type: Number,
        default: 0
    }, viewsNum: {
        type: Number,
        default: 0
    }, activeness: {
        type: Number,
        default: 0
    }, comments: [[CommentSchema_1.CommentSchema]], commentsNum: {
        type: Number,
        default: 0
    }, createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }, status: {
        type: String,
        uppercase: true,
        enum: _.values(constant_1.constant.SUGGESTION_STATUS),
        default: constant_1.constant.SUGGESTION_STATUS.ACTIVE
    }, abusedStatus: {
        type: String,
        uppercase: true,
        enum: _.values(constant_1.constant.SUGGESTION_ABUSED_STATUS)
    }, subscribers: [SubscriberSchema_1.SubscriberSchema], reference: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'cvote'
        }
    ], tags: [tag] });
//# sourceMappingURL=SuggestionSchema.js.map