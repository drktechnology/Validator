"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task_Candidate = exports.Task = exports.TaskActivity = exports.TaskCandidate = exports.TaskAdjustments = exports.TaskReward = exports.TaskUpfront = exports.TaskOutput = void 0;
const mongoose_1 = require("mongoose");
const constant_1 = require("../../constant");
const CommentSchema_1 = require("./CommentSchema");
const SubscriberSchema_1 = require("./SubscriberSchema");
const PictureSchema_1 = require("./PictureSchema");
exports.TaskOutput = {
    description: String,
    images: [String]
};
exports.TaskUpfront = {
    ela: Number,
    usd: Number,
    elaDisbursed: Number,
    elaPerUsd: Number,
    isUsd: Boolean
};
exports.TaskReward = {
    ela: Number,
    usd: Number,
    elaDisbursed: Number,
    votePower: Number,
    elaPerUsd: Number,
    isUsd: Boolean
};
exports.TaskAdjustments = {
    ela: Number,
    usd: Number,
    elaDisbursed: Number,
    votePower: Number,
    elaPerUsd: Number,
    isUsd: Boolean
};
exports.TaskCandidate = {
    type: {
        type: String,
        required: true
    },
    team: { type: mongoose_1.Schema.Types.ObjectId, ref: 'team' },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    attachment: {
        type: String
    },
    attachmentType: String,
    attachmentFilename: String,
    category: String,
    status: {
        type: String
    },
    bid: Number,
    applyMsg: String,
    complete: Boolean,
    approvedBy: mongoose_1.Schema.Types.ObjectId,
    approvedDate: Date,
    output: exports.TaskOutput,
    comments: [[CommentSchema_1.CommentSchema]],
    lastSeenByOwner: Date,
    lastSeenByCandidate: Date
};
exports.TaskActivity = {
    type: {
        type: String,
        required: true
    },
    userId: mongoose_1.Schema.Types.ObjectId,
    notes: String
};
const ProjectPitch = {
    problem: String,
    valueProposition: String,
    useCase: String,
    beneficiaries: String,
    elaInfrastructure: String
};
exports.Task = {
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    descBreakdown: String,
    goals: String,
    pitch: ProjectPitch,
    thumbnail: {
        type: String
    },
    thumbnailType: String,
    thumbnailFilename: String,
    attachment: {
        type: String
    },
    bidding: Boolean,
    referenceBid: Number,
    attachmentType: String,
    attachmentFilename: String,
    parentTaskId: {},
    community: { type: mongoose_1.Schema.Types.ObjectId, ref: 'community' },
    communityParent: { type: mongoose_1.Schema.Types.ObjectId, ref: 'community' },
    category: {
        type: String,
        default: constant_1.constant.TASK_CATEGORY.LEADER
    },
    type: {
        type: String,
        default: constant_1.constant.TASK_TYPE.TASK
    },
    location: String,
    infoLink: String,
    applicationDeadline: Date,
    completionDeadline: Date,
    eventDateStatus: String,
    eventDateRange: Boolean,
    eventDateRangeStart: Date,
    eventDateRangeEnd: Date,
    status: {
        type: String
    },
    candidateLimit: {
        type: Number,
        min: 1
    },
    candidateSltLimit: {
        type: Number,
        min: 1,
        default: 1
    },
    rewardUpfront: exports.TaskUpfront,
    reward: exports.TaskReward,
    assignSelf: Boolean,
    approved: Boolean,
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    approvedDate: Date,
    budgetDisbursed: Boolean,
    budgetDisburseMemo: String,
    readDisclaimer: Boolean,
    candidates: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'task_candidate' }],
    candidateCompleted: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'task_candidate' }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    comments: [[CommentSchema_1.CommentSchema]],
    subscribers: [SubscriberSchema_1.SubscriberSchema],
    lastCommentSeenByOwner: Date,
    domain: [String],
    recruitedSkillsets: [String],
    pictures: [PictureSchema_1.PictureSchema],
    dAppId: Number,
    archived: Boolean,
    circle: { type: mongoose_1.Schema.Types.ObjectId, ref: 'team' }
};
exports.Task_Candidate = Object.assign(Object.assign({}, exports.TaskCandidate), { task: { type: mongoose_1.Schema.Types.ObjectId, ref: 'task' } });
//# sourceMappingURL=TaskSchema.js.map