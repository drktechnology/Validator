"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELIP_REVIEW_STATUS = exports.ELIP_FILTER = exports.ELIP_STATUS = exports.DB_SELECTED_FIELDS = exports.DB_EXCLUDED_FIELDS = exports.SUGGESTION_TAG_TYPE = exports.SUGGESTION_ABUSED_STATUS = exports.SUGGESTION_STATUS = exports.USER_PROFESSION = exports.SORT_ORDER = exports.USER_SKILLSET = exports.ONE_DAY = exports.CONTENT_TYPE = exports.CVOTE_EXPIRATION = exports.CVOTE_RESULT = exports.CVOTE_SUMMARY_STATUS = exports.CVOTE_TRACKING_STATUS = exports.CVOTE_STATUS = exports.TASK_CANDIDATE_CATEGORY = exports.TEAM_TYPE = exports.TEAM_USER_STATUS = exports.TEAM_ROLE = exports.TEAM_SUBCATEGORY = exports.TEAM_TASK_DOMAIN = exports.SKILLSET_TYPE = exports.SUBMISSION_CAMPAIGN = exports.SUBMISSION_TYPE = exports.LOG_TYPE = exports.TRANS_STATUS = exports.COMMUNITY_TYPE = exports.TASK_CANDIDATE_STATUS = exports.TASK_CANDIDATE_TYPE = exports.TASK_STATUS = exports.TASK_CATEGORY = exports.TASK_TYPE = exports.USER_LANGUAGE = exports.USER_ROLE = exports.CVOTE_TYPE = exports.SUGGESTION_TYPE = exports.EVENT = exports.STATE = void 0;
const _ = require("lodash");
const create = (constant_list) => {
    const map = {};
    _.each(constant_list, key => {
        map[key] = key;
    });
    return map;
};
exports.STATE = {
    cursor: 'cursor',
    cpt: 'cpt',
    count: 'count',
    acceptedRange: 'acceptedRange',
    lockRange: 'lockRange',
    coinSupply: 'coinSupply',
    totalStake: 'totalStake',
    contractBalance: 'contractBalance',
};
exports.EVENT = {
    Joined: 'Joined',
    Staked: 'Staked',
    Unstaked: 'Unstaked',
    Left: 'Left',
    FrozenIncreased: 'FrozenIncreased',
    FrozenDecreased: 'FrozenDecreased',
    Claimed: 'Claimed',
    Cashout: 'Cashout',
    Slashed: 'Slashed',
    Penalized: 'Penalized',
    Locked: 'Locked',
    CptUpdated: 'CptUpdated',
    CreditUpdated: 'CreditUpdated',
    LastBalanceUpdated: 'LastBalanceUpdated',
    ProofSubmitted: 'ProofSubmitted',
    PointUpdated: 'PointUpdated',
    StartTimer: 'StartTimer',
    MetadataUpdated: 'MetadataUpdated',
};
exports.SUGGESTION_TYPE = {
    NEW_MOTION: '1',
    MOTION_AGAINST: '2',
    ANYTHING_ELSE: '3'
};
exports.CVOTE_TYPE = {
    NEW_MOTION: '1',
    MOTION_AGAINST: '2',
    ANYTHING_ELSE: '3'
};
exports.USER_ROLE = {
    ADMIN: 'ADMIN',
    COUNCIL: 'COUNCIL',
    SECRETARY: 'SECRETARY',
    CUSTOM: 'CUSTOM',
    MEMBER: 'MEMBER',
    LEADER: 'LEADER'
};
exports.USER_LANGUAGE = {
    en: 'en',
    zh: 'zh'
};
exports.TASK_TYPE = {
    TASK: 'TASK',
    SUB_TASK: 'SUB_TASK',
    PROJECT: 'PROJECT',
    EVENT: 'EVENT'
};
exports.TASK_CATEGORY = {
    GENERAL: 'GENERAL',
    SOCIAL: 'SOCIAL',
    DEVELOPER: 'DEVELOPER',
    LEADER: 'LEADER',
    CR100: 'CR100'
};
exports.TASK_STATUS = {
    PROPOSAL: 'PROPOSAL',
    CREATED: 'CREATED',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    ASSIGNED: 'ASSIGNED',
    SUBMITTED: 'SUBMITTED',
    SUCCESS: 'SUCCESS',
    DISTRIBUTED: 'DISTRIBUTED',
    CANCELED: 'CANCELED',
    EXPIRED: 'EXPIRED'
};
exports.TASK_CANDIDATE_TYPE = {
    USER: 'USER',
    TEAM: 'TEAM'
};
exports.TASK_CANDIDATE_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};
exports.COMMUNITY_TYPE = {
    COUNTRY: 'COUNTRY',
    STATE: 'STATE',
    CITY: 'CITY',
    REGION: 'REGION',
    SCHOOL: 'SCHOOL'
};
exports.TRANS_STATUS = {
    PENDING: 'PENDING',
    CANCELED: 'CANCELED',
    FAILED: 'FAILED',
    SUCCESSFUL: 'SUCCESSFUL'
};
exports.LOG_TYPE = {
    APPLY_TEAM: 'apply_team'
};
exports.SUBMISSION_TYPE = {
    BUG: 'BUG',
    SECURITY_ISSUE: 'SECURITY_ISSUE',
    SUGGESTION: 'SUGGESTION',
    ADD_COMMUNITY: 'ADD_COMMUNITY',
    OTHER: 'OTHER',
    FORM_EXT: 'FORM_EXT',
    EMPOWER_35: 'EMPOWER_35'
};
exports.SUBMISSION_CAMPAIGN = {
    COMMUNITY_ORGANIZER: 'COMMUNITY_ORGANIZER',
    ANNI_2008: 'ANNI_2008',
    ANNI_VIDEO_2008: 'ANNI_VIDEO_2008',
    EMPOWER_35: 'EMPOWER_35'
};
exports.SKILLSET_TYPE = create([
    'CPP',
    'JAVASCRIPT',
    'GO',
    'PYTHON',
    'JAVA',
    'SWIFT'
]);
exports.TEAM_TASK_DOMAIN = create([
    'MEDIA',
    'IOT',
    'AUTHENTICITY',
    'CURRENCY',
    'GAMING',
    'FINANCE',
    'SOVEREIGNTY',
    'SOCIAL',
    'EXCHANGE'
]);
exports.TEAM_SUBCATEGORY = create(['ESSENTIAL', 'ADVANCED', 'SERVICES']);
exports.TEAM_ROLE = create(['MEMBER', 'LEADER']);
exports.TEAM_USER_STATUS = create(['NORMAL', 'PENDING', 'REJECT']);
exports.TEAM_TYPE = create(['TEAM', 'CRCLE']);
exports.TASK_CANDIDATE_CATEGORY = {
    RSVP: 'RSVP'
};
exports.CVOTE_STATUS = create([
    'DRAFT',
    'PROPOSED',
    'ACTIVE',
    'REJECT',
    'FINAL',
    'DEFERRED',
    'INCOMPLETED'
]);
exports.CVOTE_TRACKING_STATUS = create([
    'DRAFT',
    'REVIEWING',
    'PUBLISHED',
    'REJECT'
]);
exports.CVOTE_SUMMARY_STATUS = create([
    'DRAFT',
    'REVIEWING',
    'PUBLISHED',
    'REJECT'
]);
exports.CVOTE_RESULT = {
    SUPPORT: 'support',
    REJECT: 'reject',
    ABSTENTION: 'abstention',
    UNDECIDED: 'undecided'
};
exports.CVOTE_EXPIRATION = 1000 * 60 * 60 * 24 * 7;
exports.CONTENT_TYPE = create(['MARKDOWN', 'HTML']);
exports.ONE_DAY = 1000 * 60 * 60 * 24;
exports.USER_SKILLSET = {
    DESIGN: create([
        'LOGO_DESIGN',
        'FLYERS',
        'PACKAGING',
        'ILLUSTRATION',
        'INFOGRAPHIC',
        'PRODUCT_DESIGN',
        'MERCHANDISE',
        'PHOTOSHOP'
    ]),
    MARKETING: create([
        'SOCIAL_MEDIA_MARKETING',
        'SEO',
        'CONTENT_MARKETING',
        'VIDEO_MARKETING',
        'EMAIL_MARKETING',
        'MARKETING_STRATEGY',
        'WEB_ANALYTICS',
        'ECOMMERCE',
        'MOBILE_ADVERTISING'
    ]),
    WRITING: create([
        'TRANSLATION',
        'PRODUCT_DESCRIPTIONS',
        'WEBSITE_CONTENT',
        'TECHNICAL_WRITING',
        'PROOFREADING',
        'CREATIVE_WRITING',
        'ARTICLES_WRITING',
        'SALES_COPY',
        'PRESS_RELEASES',
        'LEGAL_WRITING'
    ]),
    VIDEO: create([
        'INTROS',
        'LOGO_ANIMATION',
        'PROMO_VIDEOS',
        'VIDEO_ADS',
        'VIDEO_EDITING',
        'VIDEO_MODELING',
        'PRODUCT_PHOTO'
    ]),
    MUSIC: create(['VOICE_OVER', 'MIXING', 'MUSIC_PRODUCTION']),
    DEVELOPER: Object.assign(Object.assign({}, exports.SKILLSET_TYPE), create(['SOFTWARE_TESTING'])),
    BUSINESS: create([
        'VIRTUAL_ASSISTANT',
        'DATA_ENTRY',
        'MARKET_RESEARCH',
        'BUSINESS_PLANS',
        'LEGAL_CONSULTING',
        'FINANCIAL_CONSULTING',
        'PRESENTATION'
    ])
};
exports.SORT_ORDER = {
    ASC: 1,
    DESC: -1
};
exports.USER_PROFESSION = create([
    'ENGINEERING',
    'COMPUTER_SCIENCE',
    'PRODUCT_MANAGEMENT',
    'ART_DESIGN',
    'SALES',
    'MARKETING',
    'BUSINESS_FINANCE',
    'ENTREPRENEUR',
    'STUDENT',
    'HEALTH_MEDICINE',
    'LITERATURE_WRITING',
    'TRANSLATION',
    'LAW',
    'ECONOMICS',
    'MANAGEMENT'
]);
exports.SUGGESTION_STATUS = create(['ACTIVE', 'ABUSED', 'ARCHIVED']);
exports.SUGGESTION_ABUSED_STATUS = create(['REPORTED', 'HANDLED']);
exports.SUGGESTION_TAG_TYPE = create([
    'UNDER_CONSIDERATION',
    'INFO_NEEDED',
    'ADDED_TO_PROPOSAL'
]);
exports.DB_EXCLUDED_FIELDS = {
    USER: {
        SENSITIVE: '-password -salt -email -resetToken'
    }
};
exports.DB_SELECTED_FIELDS = {
    USER: {
        NAME: 'profile.firstName profile.lastName username',
        NAME_EMAIL: 'profile.firstName profile.lastName username email',
        NAME_AVATAR: 'profile.avatar profile.firstName profile.lastName username'
    },
    SUGGESTION: {
        ID: 'displayId'
    },
    CVOTE: {
        ID: 'vid',
        ID_STATUS: 'vid status'
    }
};
exports.ELIP_STATUS = create([
    'WAIT_FOR_REVIEW',
    'DRAFT',
    'REJECTED',
    'SUBMITTED'
]);
exports.ELIP_FILTER = create([
    'ALL',
    'DRAFT',
    'SUBMITTED_BY_ME',
    'WAIT_FOR_REVIEW'
]);
exports.ELIP_REVIEW_STATUS = create([
    'APPROVED',
    'REJECTED'
]);
//# sourceMappingURL=constant.js.map