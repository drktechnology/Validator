"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
exports.Transaction = {
    taskId: mongoose_1.Schema.Types.ObjectId,
    communityId: mongoose_1.Schema.Types.ObjectId,
    userId: mongoose_1.Schema.Types.ObjectId,
    method: {
        type: String,
        default: 'MANUAL'
    },
    type: {
        type: String
    },
    amount: mongoose_1.Schema.Types.Number,
    elaFromAddress: {
        type: String
    },
    elaToAddress: {
        type: String
    },
    elaTransaction: mongoose_1.Schema.Types.String,
    status: {
        type: String
    },
    paidBy: mongoose_1.Schema.Types.ObjectId,
    paidDate: {
        type: Date,
        required: false,
        min: Date.now
    },
    createdBy: mongoose_1.Schema.Types.ObjectId
};
//# sourceMappingURL=TransactionSchema.js.map