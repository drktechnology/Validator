"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Elip_Review = void 0;
const mongoose_1 = require("mongoose");
const _ = require("lodash");
const constant_1 = require("../../constant");
exports.Elip_Review = {
    comment: {
        type: String
    },
    status: {
        type: String,
        enum: _.values(constant_1.constant.ELIP_REVIEW_STATUS)
    },
    elipId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'elip'
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
};
//# sourceMappingURL=ElipReviewSchema.js.map