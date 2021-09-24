"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Release = void 0;
const mongoose_1 = require("mongoose");
exports.Release = {
    title: String,
    desc: String,
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
};
//# sourceMappingURL=ReleaseSchema.js.map