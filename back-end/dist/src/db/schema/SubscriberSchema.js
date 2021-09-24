"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberSchema = void 0;
const mongoose_1 = require("mongoose");
exports.SubscriberSchema = {
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    lastSeen: {
        type: Date,
        required: false
    }
};
//# sourceMappingURL=SubscriberSchema.js.map