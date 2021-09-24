"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentSchema = void 0;
const mongoose_1 = require("mongoose");
exports.CommentSchema = {
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    headline: String,
    createdAt: Date
};
//# sourceMappingURL=CommentSchema.js.map