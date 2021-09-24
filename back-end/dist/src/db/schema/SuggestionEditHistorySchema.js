"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionEditHistory = void 0;
const mongoose_1 = require("mongoose");
const constant_1 = require("../../constant");
const _ = require("lodash");
const SuggestionCore = {
    title: {
        type: String
    },
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
exports.SuggestionEditHistory = Object.assign(Object.assign({}, SuggestionCore), { suggestion: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'suggestion',
        required: true
    } });
//# sourceMappingURL=SuggestionEditHistorySchema.js.map