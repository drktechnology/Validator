"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = exports.CampaignCandidate = exports.CampaignReward = exports.CampaignOutput = void 0;
const mongoose_1 = require("mongoose");
const UserSchema_1 = require("./UserSchema");
exports.CampaignOutput = {
    description: String,
    images: [String]
};
exports.CampaignReward = {
    ela: UserSchema_1.ELA,
    votePower: UserSchema_1.VotePower
};
exports.CampaignCandidate = {
    type: {
        type: String,
        required: true
    },
    ID: mongoose_1.Schema.Types.ObjectId,
    status: {
        type: String
    },
    output: exports.CampaignOutput
};
exports.Campaign = {
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'task'
    },
    startTime: {
        type: Date,
        required: true,
        min: Date.now
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String
    },
    candidateLimit: {
        type: Number,
        min: 1,
        required: true
    },
    candidates: [exports.CampaignCandidate],
    reward: exports.CampaignReward
};
//# sourceMappingURL=CampaignSchema.js.map