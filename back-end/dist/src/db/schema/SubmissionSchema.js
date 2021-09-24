"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submission = void 0;
const mongoose_1 = require("mongoose");
const CommentSchema_1 = require("./CommentSchema");
const SubscriberSchema_1 = require("./SubscriberSchema");
const communityProps = {
    community: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'community'
    },
    state: {
        type: String
    },
    city: {
        type: String
    }
};
exports.Submission = Object.assign(Object.assign({ type: {
        type: String,
        required: true
    }, campaign: {
        type: String
    }, title: {
        type: String,
        required: true
    }, description: {
        type: String
    }, email: String, fullLegalName: String, passportNumber: String, passportUpload: String, passportUploadType: String, passportFilename: String, occupation: String, education: String, location: String, audienceInfo: String, publicSpeakingExp: String, eventOrganizingExp: String, previousExp: String, isDeveloper: Boolean, devBackground: String, dob: Date, reason: String, suitedReason: String, attachment: String, attachmentType: String, attachmentFilename: String, createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users'
    }, comments: [[CommentSchema_1.CommentSchema]], subscribers: [SubscriberSchema_1.SubscriberSchema], lastCommentSeenByOwner: Date }, communityProps), { archived: Boolean });
//# sourceMappingURL=SubmissionSchema.js.map