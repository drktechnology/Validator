"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteLog = void 0;
const mongoose_1 = require("mongoose");
exports.VoteLog = {
    taskId: mongoose_1.Schema.Types.ObjectId,
    communityId: mongoose_1.Schema.Types.ObjectId,
    userId: mongoose_1.Schema.Types.ObjectId,
    amount: {},
    status: {
        type: String
    },
    paidBy: mongoose_1.Schema.Types.ObjectId,
    paidDate: {
        type: Date,
        required: false,
        min: Date.now
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        min: Date.now
    },
    createdBy: mongoose_1.Schema.Types.ObjectId,
    updatedAt: {
        type: Date,
        required: false,
        min: Date.now
    }
};
//# sourceMappingURL=VoteLogSchema.js.map