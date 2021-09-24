"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = require("mongoose");
exports.Event = {
    validator: mongoose_1.Schema.Types.ObjectId,
    name: String,
    blockNumber: Number,
    data: Object
};
//# sourceMappingURL=EventSchema.js.map