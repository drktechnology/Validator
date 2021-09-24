"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User_Team = exports.Team = exports.TeamProfile = void 0;
const mongoose_1 = require("mongoose");
const PictureSchema_1 = require("./PictureSchema");
const CommentSchema_1 = require("./CommentSchema");
exports.TeamProfile = {
    description: String,
    logo: String
};
exports.Team = {
    name: {
        type: String,
        required: true
    },
    name_zh: String,
    metadata: {
        type: Map,
        of: String
    },
    type: {
        type: String,
        required: true
    },
    tags: [String],
    profile: exports.TeamProfile,
    domain: [String],
    recruitedSkillsets: [String],
    subcategory: String,
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'user_team' }],
    pictures: [PictureSchema_1.PictureSchema],
    comments: [[CommentSchema_1.CommentSchema]],
    tasks: {
        count: Number,
        budget: {
            usd: Number,
            ela: Number
        }
    }
};
exports.User_Team = {
    status: {
        type: String
    },
    level: String,
    role: String,
    title: String,
    apply_reason: String,
    team: { type: mongoose_1.Schema.Types.ObjectId, ref: 'team' },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    comments: [[CommentSchema_1.CommentSchema]]
};
//# sourceMappingURL=TeamSchema.js.map