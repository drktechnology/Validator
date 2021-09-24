"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.VotePower = exports.ELA = exports.WorkAbout = exports.WorkProject = exports.Profile = exports.Contact = exports.Region = void 0;
const mongoose_1 = require("mongoose");
const CommentSchema_1 = require("./CommentSchema");
const SubscriberSchema_1 = require("./SubscriberSchema");
exports.Region = {
    country: String,
    state: String,
    city: String
};
exports.Contact = {
    type: Map,
    of: String
};
exports.Profile = {
    firstName: String,
    lastName: String,
    avatar: String,
    avatarFilename: String,
    avatarFileType: String,
    banner: String,
    bannerFilename: String,
    bannerFileType: String,
    gender: String,
    birth: Date,
    timezone: String,
    region: exports.Region,
    country: String,
    state: String,
    city: String,
    profession: String,
    telegram: String,
    reddit: String,
    wechat: String,
    twitter: String,
    facebook: String,
    github: String,
    linkedin: String,
    portfolio: String,
    skillset: [String],
    bio: String,
    motto: String,
    beOrganizer: Boolean,
    isDeveloper: Boolean,
    source: String,
    walletAddress: String
};
exports.WorkProject = {
    startTime: Date,
    endTime: Date,
    description: String,
    name: String
};
exports.WorkAbout = {
    status: String,
    employment: String,
    skill: [String],
    project: [exports.WorkProject],
    resume: String,
    notes: String
};
exports.ELA = {
    address: String,
    amount: mongoose_1.Schema.Types.Number
};
exports.VotePower = {
    amount: Number,
    expired: Date
};
exports.User = {
    username: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    email: String,
    profile: exports.Profile,
    defaultLanguage: String,
    workAbout: exports.WorkAbout,
    resetToken: String,
    role: String,
    empower: String,
    elaOwed: [exports.ELA],
    notes: String,
    elaBudget: [exports.ELA],
    votePower: [exports.VotePower],
    votePowerAmount: {},
    active: {
        type: Boolean,
        default: false
    },
    logins: [Date],
    circles: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'team' }],
    comments: [[CommentSchema_1.CommentSchema]],
    subscribers: [SubscriberSchema_1.SubscriberSchema],
    popupUpdate: {
        type: Boolean,
        default: false
    }
};
//# sourceMappingURL=UserSchema.js.map