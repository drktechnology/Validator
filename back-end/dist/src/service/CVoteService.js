"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const _ = require("lodash");
const constant_1 = require("../constant");
const utility_1 = require("../utility");
const moment = require("moment");
const utility_2 = require("../utility");
let tm = undefined;
const BASE_FIELDS = ['title', 'abstract', 'goal', 'motivation', 'relevance', 'budget', 'plan'];
const restrictedFields = {
    update: ['_id', 'createdBy', 'createdAt', 'proposedAt']
};
class default_1 extends Base_1.default {
    createDraft(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_suggestion = this.getDBModel('Suggestion');
            const db_cvote = this.getDBModel('CVote');
            const { title, proposedBy, proposer, suggestionId } = param;
            const vid = yield this.getNewVid();
            const doc = {
                title,
                vid,
                status: constant_1.constant.CVOTE_STATUS.DRAFT,
                published: false,
                contentType: constant_1.constant.CONTENT_TYPE.MARKDOWN,
                proposedBy,
                proposer: proposer ? proposer : this.currentUser._id,
                createdBy: this.currentUser._id
            };
            const suggestion = suggestionId && (yield db_suggestion.findById(suggestionId));
            if (!_.isEmpty(suggestion)) {
                doc.reference = suggestionId;
            }
            Object.assign(doc, _.pick(suggestion, BASE_FIELDS));
            try {
                return yield db_cvote.save(doc);
            }
            catch (error) {
                utility_2.logger.error(error);
                return;
            }
        });
    }
    proposeSuggestion(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_suggestion = this.getDBModel('Suggestion');
            const db_cvote = this.getDBModel('CVote');
            const db_user = this.getDBModel('User');
            const { suggestionId } = param;
            const suggestion = suggestionId && (yield db_suggestion.findById(suggestionId));
            if (!suggestion) {
                throw 'cannot find suggestion';
            }
            const creator = yield db_user.findById(suggestion.createdBy);
            const vid = yield this.getNewVid();
            const doc = {
                vid,
                type: suggestion.type,
                status: constant_1.constant.CVOTE_STATUS.PROPOSED,
                published: true,
                contentType: constant_1.constant.CONTENT_TYPE.MARKDOWN,
                proposedBy: utility_2.user.formatUsername(creator),
                proposer: suggestion.createdBy,
                createdBy: this.currentUser._id,
                reference: suggestionId
            };
            Object.assign(doc, _.pick(suggestion, BASE_FIELDS));
            const councilMembers = yield db_user.find({
                role: constant_1.constant.USER_ROLE.COUNCIL
            });
            const voteResult = [];
            doc.proposedAt = Date.now();
            _.each(councilMembers, user => voteResult.push({
                votedBy: user._id,
                value: constant_1.constant.CVOTE_RESULT.UNDECIDED
            }));
            doc.voteResult = voteResult;
            doc.voteHistory = voteResult;
            try {
                const res = yield db_cvote.save(doc);
                yield db_suggestion.update({ _id: suggestionId }, {
                    $addToSet: { reference: res._id },
                    $set: { tags: [] }
                });
                this.notifySubscribers(res);
                this.notifyCouncil(res);
                return res;
            }
            catch (error) {
                utility_2.logger.error(error);
                return;
            }
        });
    }
    updateDraft(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_cvote = this.getDBModel('CVote');
            const { _id, title, type, abstract, goal, motivation, relevance, budget, plan } = param;
            if (!this.currentUser || !this.currentUser._id) {
                throw 'cvoteservice.update - invalid current user';
            }
            if (!this.canManageProposal()) {
                throw 'cvoteservice.update - not council';
            }
            const cur = yield db_cvote.findOne({ _id });
            if (!cur) {
                throw 'cvoteservice.update - invalid proposal id';
            }
            const doc = {
                contentType: constant_1.constant.CONTENT_TYPE.MARKDOWN
            };
            if (title)
                doc.title = title;
            if (type)
                doc.type = type;
            if (abstract)
                doc.abstract = abstract;
            if (goal)
                doc.goal = goal;
            if (motivation)
                doc.motivation = motivation;
            if (relevance)
                doc.relevance = relevance;
            if (budget)
                doc.budget = budget;
            if (plan)
                doc.plan = plan;
            try {
                yield db_cvote.update({ _id }, doc);
                const res = yield this.getById(_id);
                return res;
            }
            catch (error) {
                utility_2.logger.error(error);
                return;
            }
        });
    }
    deleteDraft(param) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db_cvote = this.getDBModel('CVote');
                const { _id } = param;
                const doc = yield db_cvote.findOne({ _id });
                if (!doc) {
                    throw 'cvoteservice.deleteDraft - invalid proposal id';
                }
                if (doc.status !== constant_1.constant.CVOTE_STATUS.DRAFT) {
                    throw 'cvoteservice.deleteDraft - not draft proposal';
                }
                return yield db_cvote.remove({ _id });
            }
            catch (error) {
                utility_2.logger.error(error);
            }
        });
    }
    create(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_cvote = this.getDBModel('CVote');
            const db_user = this.getDBModel('User');
            const db_suggestion = this.getDBModel('Suggestion');
            const currentUserId = _.get(this.currentUser, '_id');
            const { title, published, proposedBy, proposer, suggestionId, abstract, goal, motivation, relevance, budget, plan } = param;
            const vid = yield this.getNewVid();
            const status = published
                ? constant_1.constant.CVOTE_STATUS.PROPOSED
                : constant_1.constant.CVOTE_STATUS.DRAFT;
            const doc = {
                title,
                vid,
                status,
                published,
                contentType: constant_1.constant.CONTENT_TYPE.MARKDOWN,
                proposedBy,
                abstract,
                goal,
                motivation,
                relevance,
                budget,
                plan,
                proposer,
                createdBy: this.currentUser._id
            };
            const suggestion = suggestionId && (yield db_suggestion.findById(suggestionId));
            if (!_.isEmpty(suggestion)) {
                doc.reference = suggestionId;
            }
            const councilMembers = yield db_user.find({
                role: constant_1.constant.USER_ROLE.COUNCIL
            });
            const voteResult = [];
            if (published) {
                doc.proposedAt = Date.now();
                _.each(councilMembers, user => voteResult.push({
                    votedBy: user._id,
                    value: constant_1.constant.CVOTE_RESULT.UNDECIDED
                }));
                doc.voteResult = voteResult;
                doc.voteHistory = voteResult;
            }
            try {
                const res = yield db_cvote.save(doc);
                if (!_.isEmpty(suggestion)) {
                    yield db_suggestion.update({ _id: suggestionId }, { $addToSet: { reference: res._id } });
                    if (published)
                        this.notifySubscribers(res);
                }
                if (published)
                    this.notifyCouncil(res);
                return res;
            }
            catch (error) {
                utility_2.logger.error(error);
                return;
            }
        });
    }
    notifySubscribers(cvote) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_suggestion = this.getDBModel('Suggestion');
            const suggestionId = _.get(cvote, 'reference');
            if (!suggestionId)
                return;
            const suggestion = yield db_suggestion
                .getDBInstance()
                .findById(suggestionId)
                .populate('subscribers.user', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL)
                .populate('createdBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL);
            const toUsers = _.map(suggestion.subscribers, 'user') || [];
            toUsers.push(suggestion.createdBy);
            const toMails = _.map(toUsers, 'email');
            const subject = `The suggestion is referred in Proposal #${cvote.vid}`;
            const body = `
      <p>Council member ${cvote.proposedBy} has refer to your suggestion ${suggestion.title} in a proposal #${cvote.vid}.</p>
      <br />
      <p>Click this link to view more details:</p>
      <p><a href="${process.env.SERVER_URL}/proposals/${cvote._id}">${process.env.SERVER_URL}/proposals/${cvote._id}</a></p>
      <br /> <br />
      <p>Thanks</p>
      <p>${process.env.PROJECT} Team</p>
    `;
            const recVariables = _.zipObject(toMails, _.map(toUsers, user => {
                return {
                    _id: user._id,
                    username: utility_2.user.formatUsername(user)
                };
            }));
            const mailObj = {
                to: toMails,
                subject,
                body,
                recVariables
            };
            utility_2.mail.send(mailObj);
        });
    }
    notifyCouncil(cvote) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            const currentUserId = _.get(this.currentUser, '_id');
            const councilMembers = yield db_user.find({
                role: constant_1.constant.USER_ROLE.COUNCIL
            });
            const toUsers = _.filter(councilMembers, user => !user._id.equals(currentUserId));
            const toMails = _.map(toUsers, 'email');
            const subject = `New Proposal: ${cvote.title}`;
            const body = `
      <p>There is a new proposal added:</p>
      <br />
      <p>${cvote.title}</p>
      <br />
      <p>Click this link to view more details: <a href="${process.env.SERVER_URL}/proposals/${cvote._id}">${process.env.SERVER_URL}/proposals/${cvote._id}</a></p>
      <br /> <br />
      <p>Thanks</p>
      <p>${process.env.SERVER_URL} Team</p>
    `;
            const recVariables = _.zipObject(toMails, _.map(toUsers, user => {
                return {
                    _id: user._id,
                    username: utility_2.user.formatUsername(user)
                };
            }));
            const mailObj = {
                to: toMails,
                subject,
                body,
                recVariables
            };
            utility_2.mail.send(mailObj);
        });
    }
    notifyCouncilToVote() {
        return __awaiter(this, void 0, void 0, function* () {
            const db_cvote = this.getDBModel('CVote');
            const nearExpiredTime = Date.now() - (constant_1.constant.CVOTE_EXPIRATION - constant_1.constant.ONE_DAY);
            const unvotedCVotes = yield db_cvote
                .getDBInstance()
                .find({
                proposedAt: {
                    $lt: nearExpiredTime,
                    $gt: Date.now() - constant_1.constant.CVOTE_EXPIRATION
                },
                notified: { $ne: true },
                status: constant_1.constant.CVOTE_STATUS.PROPOSED
            })
                .populate('voteResult.votedBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL);
            _.each(unvotedCVotes, cvote => {
                _.each(cvote.voteResult, result => {
                    if (result.value === constant_1.constant.CVOTE_RESULT.UNDECIDED) {
                        const { title, _id } = cvote;
                        const subject = `Proposal Vote Reminder: ${title}`;
                        const body = `
            <p>You only got 24 hours to vote this proposal:</p>
            <br />
            <p>${title}</p>
            <br />
            <p>Click this link to vote: <a href="${process.env.SERVER_URL}/proposals/${_id}">${process.env.SERVER_URL}/proposals/${_id}</a></p>
            <br /> <br />
            <p>Thanks</p>
            <p>${process.env.SERVER_URL} Team</p>
          `;
                        const mailObj = {
                            to: result.votedBy.email,
                            toName: utility_2.user.formatUsername(result.votedBy),
                            subject,
                            body
                        };
                        utility_2.mail.send(mailObj);
                        db_cvote.update({ _id: cvote._id }, { $set: { notified: true } });
                    }
                });
            });
        });
    }
    list(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_cvote = this.getDBModel('CVote');
            const currentUserId = _.get(this.currentUser, '_id');
            const userRole = _.get(this.currentUser, 'role');
            const query = {};
            if (!param.published) {
                if (!this.isLoggedIn() || !this.canManageProposal()) {
                    throw 'cvoteservice.list - unpublished proposals only visible to council/secretary';
                }
                else if (param.voteResult === constant_1.constant.CVOTE_RESULT.UNDECIDED &&
                    utility_1.permissions.isCouncil(userRole)) {
                    query.voteResult = {
                        $elemMatch: {
                            value: constant_1.constant.CVOTE_RESULT.UNDECIDED,
                            votedBy: currentUserId
                        }
                    };
                    query.published = true;
                    query.status = constant_1.constant.CVOTE_STATUS.PROPOSED;
                }
            }
            else {
                query.published = param.published;
            }
            if (param.$or)
                query.$or = param.$or;
            const fields = 'vid title type proposedBy status published proposedAt createdAt voteResult vote_map';
            const list = yield db_cvote.list(query, { vid: -1 }, 100, fields);
            return list;
        });
    }
    update(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            const db_cvote = this.getDBModel('CVote');
            const currentUserId = _.get(this.currentUser, '_id');
            const { _id, published, notes, title, abstract, goal, motivation, relevance, budget, plan } = param;
            if (!this.currentUser || !this.currentUser._id) {
                throw 'cvoteservice.update - invalid current user';
            }
            if (!this.canManageProposal()) {
                throw 'cvoteservice.update - not council';
            }
            const cur = yield db_cvote.findOne({ _id });
            if (!cur) {
                throw 'cvoteservice.update - invalid proposal id';
            }
            const doc = {
                contentType: constant_1.constant.CONTENT_TYPE.MARKDOWN
            };
            const willChangeToPublish = published === true && cur.status === constant_1.constant.CVOTE_STATUS.DRAFT;
            if (title)
                doc.title = title;
            if (abstract)
                doc.abstract = abstract;
            if (goal)
                doc.goal = goal;
            if (motivation)
                doc.motivation = motivation;
            if (relevance)
                doc.relevance = relevance;
            if (budget)
                doc.budget = budget;
            if (plan)
                doc.plan = plan;
            if (willChangeToPublish) {
                doc.status = constant_1.constant.CVOTE_STATUS.PROPOSED;
                doc.published = published;
                doc.proposedAt = Date.now();
                const councilMembers = yield db_user.find({
                    role: constant_1.constant.USER_ROLE.COUNCIL
                });
                const voteResult = [];
                _.each(councilMembers, user => voteResult.push({
                    votedBy: user._id,
                    value: constant_1.constant.CVOTE_RESULT.UNDECIDED
                }));
                doc.voteResult = voteResult;
                doc.voteHistory = voteResult;
            }
            if (notes)
                doc.notes = notes;
            try {
                yield db_cvote.update({ _id }, doc);
                const res = yield this.getById(_id);
                if (willChangeToPublish) {
                    this.notifyCouncil(res);
                    this.notifySubscribers(res);
                }
                return res;
            }
            catch (error) {
                utility_2.logger.error(error);
                return;
            }
        });
    }
    finishById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_cvote = this.getDBModel('CVote');
            const cur = yield db_cvote.findOne({ _id: id });
            if (!cur) {
                throw 'invalid proposal id';
            }
            if (!this.canManageProposal()) {
                throw 'cvoteservice.finishById - not council';
            }
            if (_.includes([constant_1.constant.CVOTE_STATUS.FINAL], cur.status)) {
                throw 'proposal already completed.';
            }
            const rs = yield db_cvote.update({ _id: id }, {
                $set: {
                    status: constant_1.constant.CVOTE_STATUS.FINAL
                }
            });
            return rs;
        });
    }
    unfinishById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_cvote = this.getDBModel('CVote');
            const cur = yield db_cvote.findOne({ _id: id });
            if (!cur) {
                throw 'invalid proposal id';
            }
            if (!this.canManageProposal()) {
                throw 'cvoteservice.unfinishById - not council';
            }
            if (_.includes([constant_1.constant.CVOTE_STATUS.FINAL, constant_1.constant.CVOTE_STATUS.INCOMPLETED], cur.status)) {
                throw 'proposal already completed.';
            }
            const rs = yield db_cvote.update({ _id: id }, {
                $set: {
                    status: constant_1.constant.CVOTE_STATUS.INCOMPLETED
                }
            });
            return rs;
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_cvote = this.getDBModel('CVote');
            const rs = yield db_cvote
                .getDBInstance()
                .findOne({ _id: id })
                .populate('voteResult.votedBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME_AVATAR)
                .populate('proposer', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL)
                .populate('createdBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL)
                .populate('reference', constant_1.constant.DB_SELECTED_FIELDS.SUGGESTION.ID);
            return rs;
        });
    }
    getNewVid() {
        return __awaiter(this, void 0, void 0, function* () {
            const db_cvote = this.getDBModel('CVote');
            const n = yield db_cvote.count({});
            return n + 1;
        });
    }
    isExpired(data, extraTime = 0) {
        const ct = moment(data.proposedAt || data.createdAt).valueOf();
        if (Date.now() - ct - extraTime > constant_1.constant.CVOTE_EXPIRATION) {
            return true;
        }
        return false;
    }
    isActive(data) {
        const supportNum = _.countBy(data.voteResult, 'value')[constant_1.constant.CVOTE_RESULT.SUPPORT] || 0;
        return supportNum > data.voteResult.length * 0.5;
    }
    isRejected(data) {
        const rejectNum = _.countBy(data.voteResult, 'value')[constant_1.constant.CVOTE_RESULT.REJECT] || 0;
        return rejectNum > data.voteResult.length * 0.5;
    }
    vote(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_cvote = this.getDBModel('CVote');
            const { _id, value, reason } = param;
            const cur = yield db_cvote.findOne({ _id });
            const votedBy = _.get(this.currentUser, '_id');
            if (!cur) {
                throw 'invalid proposal id';
            }
            yield db_cvote.update({
                _id,
                'voteResult.votedBy': votedBy
            }, {
                $set: {
                    'voteResult.$.value': value,
                    'voteResult.$.reason': reason || ''
                },
                $push: {
                    voteHistory: {
                        value,
                        reason,
                        votedBy
                    }
                }
            });
            return yield this.getById(_id);
        });
    }
    updateNote(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_cvote = this.getDBModel('CVote');
            const { _id, notes } = param;
            const cur = yield db_cvote.findOne({ _id });
            if (!cur) {
                throw 'invalid proposal id';
            }
            if (!this.canManageProposal()) {
                throw 'cvoteservice.updateNote - not council';
            }
            if (this.currentUser.role !== constant_1.constant.USER_ROLE.SECRETARY) {
                throw 'only secretary could update notes';
            }
            const rs = yield db_cvote.update({ _id }, {
                $set: {
                    notes: notes || ''
                }
            });
            return yield this.getById(_id);
        });
    }
    eachJob() {
        return __awaiter(this, void 0, void 0, function* () {
            const db_cvote = this.getDBModel('CVote');
            const list = yield db_cvote.find({
                status: constant_1.constant.CVOTE_STATUS.PROPOSED
            });
            const idsDeferred = [];
            const idsActive = [];
            const idsRejected = [];
            _.each(list, item => {
                if (this.isExpired(item)) {
                    if (this.isActive(item)) {
                        idsActive.push(item._id);
                    }
                    else if (this.isRejected(item)) {
                        idsRejected.push(item._id);
                    }
                    else {
                        idsDeferred.push(item._id);
                    }
                }
            });
            yield db_cvote.update({
                _id: {
                    $in: idsDeferred
                }
            }, {
                status: constant_1.constant.CVOTE_STATUS.DEFERRED
            }, { multi: true });
            yield db_cvote.update({
                _id: {
                    $in: idsActive
                }
            }, {
                status: constant_1.constant.CVOTE_STATUS.ACTIVE
            }, { multi: true });
            yield db_cvote.update({
                _id: {
                    $in: idsRejected
                }
            }, {
                status: constant_1.constant.CVOTE_STATUS.REJECT
            }, { multi: true });
            this.notifyCouncilToVote();
        });
    }
    cronjob() {
        if (tm) {
            return false;
        }
        tm = setInterval(() => {
            console.log('---------------- start cvote cronjob -------------');
            this.eachJob();
        }, 1000 * 60);
    }
    canManageProposal() {
        const userRole = _.get(this.currentUser, 'role');
        return utility_1.permissions.isCouncil(userRole) || utility_1.permissions.isSecretary(userRole);
    }
}
exports.default = default_1;
//# sourceMappingURL=CVoteService.js.map