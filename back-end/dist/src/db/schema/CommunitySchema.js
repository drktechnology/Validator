"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User_Community = exports.Community = void 0;
const mongoose_1 = require("mongoose");
exports.Community = {
    name: {
        type: String,
        required: true
    },
    parentCommunityId: mongoose_1.Schema.Types.ObjectId,
    geolocation: String,
    type: String,
    leaderIds: [mongoose_1.Schema.Types.ObjectId],
    createdBy: mongoose_1.Schema.Types.ObjectId
};
exports.User_Community = {
    userId: {
        required: true,
        type: mongoose_1.Schema.Types.ObjectId
    },
    communityId: {
        required: true,
        type: mongoose_1.Schema.Types.ObjectId
    }
};
//# sourceMappingURL=CommunitySchema.js.map