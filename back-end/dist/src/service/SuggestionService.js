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
const BASE_FIELDS = ['title', 'type', 'abstract', 'goal', 'motivation', 'relevance', 'budget', 'plan'];
const emptyDoc = {
    title: '',
    type: constant_1.constant.SUGGESTION_TYPE.NEW_MOTION,
    abstract: '',
    goal: '',
    motivation: '',
    relevance: '',
    budget: '',
    plan: '',
    link: [],
};
const listExlucdedFields = [
    constant_1.constant.SUGGESTION_TAG_TYPE.UNDER_CONSIDERATION,
    constant_1.constant.SUGGESTION_TAG_TYPE.INFO_NEEDED
];
class default_1 extends Base_1.default {
    init() {
        this.model = this.getDBModel('Suggestion');
    }
    create(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = Object.assign(Object.assign({}, param), { createdBy: _.get(this.currentUser, '_id'), contentType: constant_1.constant.CONTENT_TYPE.MARKDOWN, descUpdatedAt: new Date() });
            const result = yield this.model.save(doc);
            yield this.getDBModel('Suggestion_Edit_History').save(Object.assign(Object.assign({}, param), { suggestion: result._id }));
            return result;
        });
    }
    sendMentionEmails(suggestion, mentions) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            const query = { role: constant_1.constant.USER_ROLE.COUNCIL };
            const councilMembers = yield db_user.getDBInstance().find(query)
                .select(constant_1.constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL);
            const subject = 'You were mentioned in a suggestion';
            const body = `
      <p>You were mentioned in a suggestion, click this link to view more details:</p>
      <br />
      <p><a href="${process.env.SERVER_URL}/suggestion/${suggestion._id}">${process.env.SERVER_URL}/suggestion/${suggestion._id}</a></p>
      <br /> <br />
      <p>Thanks</p>
      <p>${process.env.SERVER_URL} Team</p>
    `;
            if (_.includes(mentions, '@</span>ALL')) {
                _.map(councilMembers, user => {
                    utility_1.mail.send({
                        to: user.email,
                        toName: utility_1.user.formatUsername(user),
                        subject,
                        body
                    });
                });
                return;
            }
            const seenEmails = {};
            for (let mention of mentions) {
                const username = mention.replace('@</span>', '');
                const user = yield db_user.findOne({ username });
                const to = user.email;
                const toName = utility_1.user.formatUsername(user);
                if (seenEmails[to]) {
                    continue;
                }
                yield utility_1.mail.send({
                    to,
                    toName,
                    subject,
                    body
                });
                seenEmails[to] = true;
            }
        });
    }
    update(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, update } = param;
            const userId = _.get(this.currentUser, '_id');
            const currDoc = yield this.model.getDBInstance().findById(id);
            if (!currDoc) {
                throw 'Current document does not exist';
            }
            if (!userId.equals(_.get(currDoc, 'createdBy')) && !utility_1.permissions.isAdmin(_.get(this.currentUser, 'role'))) {
                throw 'Only owner can edit suggestion';
            }
            const doc = _.pick(param, BASE_FIELDS);
            doc.descUpdatedAt = new Date();
            if (update) {
                yield Promise.all([
                    this.model.update({ _id: id }, { $set: doc }),
                    this.getDBModel('Suggestion_Edit_History').save(Object.assign(Object.assign({}, doc), { suggestion: id }))
                ]);
            }
            else {
                yield this.model.update({ _id: id }, { $set: doc });
            }
            return this.show({ id });
        });
    }
    list(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = _.omit(param, ['results', 'page', 'sortBy', 'sortOrder', 'filter', 'profileListFor', 'search', 'tagsIncluded', 'referenceStatus']);
            const { sortBy, sortOrder, tagsIncluded, referenceStatus } = param;
            let qryTagsType;
            query.$or = [];
            if (!_.isEmpty(tagsIncluded)) {
                qryTagsType = { $in: tagsIncluded.split(',') };
                query.$or.push({ 'tags.type': qryTagsType });
            }
            if (referenceStatus === 'true') {
                query.$or.push({ reference: { $exists: true, $ne: [] } });
            }
            if (_.isEmpty(query.$or))
                delete query.$or;
            delete query['tags.type'];
            const excludedFields = [
                '-editHistory', '-comments', '-goal',
                '-motivation', '-relevance', '-budget', '-plan',
                '-subscribers', '-likes', '-dislikes', '-updatedAt'
            ];
            const sortObject = {};
            let cursor;
            if (sortBy) {
                if (sortBy === 'createdAt') {
                    sortObject['descUpdatedAt'] = _.get(constant_1.constant.SORT_ORDER, sortOrder, constant_1.constant.SORT_ORDER.DESC);
                }
                sortObject[sortBy] = _.get(constant_1.constant.SORT_ORDER, sortOrder, constant_1.constant.SORT_ORDER.DESC);
                cursor = this.model.getDBInstance()
                    .find(query, excludedFields.join(' '))
                    .populate('createdBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME)
                    .populate('reference', constant_1.constant.DB_SELECTED_FIELDS.CVOTE.ID_STATUS)
                    .sort(sortObject);
            }
            else {
                cursor = this.model.getDBInstance()
                    .find(query)
                    .populate('createdBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME)
                    .populate('reference', constant_1.constant.DB_SELECTED_FIELDS.CVOTE.ID_STATUS);
            }
            if (param.results) {
                const results = parseInt(param.results, 10);
                const page = parseInt(param.page, 10);
                cursor.skip(results * (page - 1)).limit(results);
            }
            const rs = yield Promise.all([
                cursor,
                this.model.getDBInstance().find(query).count()
            ]);
            return {
                list: rs[0],
                total: rs[1]
            };
        });
    }
    show(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: _id, incViewsNum } = param;
            if (incViewsNum === 'true') {
                yield this.model.findOneAndUpdate({ _id }, {
                    $inc: { viewsNum: 1, activeness: 1 }
                });
            }
            const doc = yield this.model.getDBInstance()
                .findById(_id)
                .populate('createdBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME)
                .populate('reference', constant_1.constant.DB_SELECTED_FIELDS.CVOTE.ID_STATUS);
            if (_.isEmpty(doc.comments))
                return doc;
            for (const comment of doc.comments) {
                for (const thread of comment) {
                    yield this.model.getDBInstance().populate(thread, {
                        path: 'createdBy',
                        select: `${constant_1.constant.DB_SELECTED_FIELDS.USER.NAME} profile.avatar`
                    });
                }
            }
            return doc;
        });
    }
    editHistories(param) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getDBModel('Suggestion_Edit_History').find({ suggestion: param.id });
        });
    }
    like(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: _id } = param;
            const userId = _.get(this.currentUser, '_id');
            const doc = yield this.model.findById(_id);
            const { likes, dislikes } = doc;
            if (_.findIndex(dislikes, oid => userId.equals(oid)) !== -1)
                return doc;
            if (_.findIndex(likes, oid => userId.equals(oid)) !== -1) {
                yield this.model.findOneAndUpdate({ _id }, {
                    $pull: { likes: userId },
                    $inc: { likesNum: -1, activeness: -1 }
                });
            }
            else {
                yield this.model.findOneAndUpdate({ _id }, {
                    $push: { likes: userId },
                    $inc: { likesNum: 1, activeness: 1 }
                });
            }
            return this.model.findById(_id);
        });
    }
    dislike(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: _id } = param;
            const userId = _.get(this.currentUser, '_id');
            const doc = yield this.model.findById(_id);
            const { likes, dislikes } = doc;
            if (_.findIndex(likes, oid => userId.equals(oid)) !== -1)
                return doc;
            if (_.findIndex(dislikes, oid => userId.equals(oid)) !== -1) {
                yield this.model.findOneAndUpdate({ _id }, {
                    $pull: { dislikes: userId },
                    $inc: { dislikesNum: -1, activeness: -1 }
                });
            }
            else {
                yield this.model.findOneAndUpdate({ _id }, {
                    $push: { dislikes: userId },
                    $inc: { dislikesNum: 1, activeness: 1 }
                });
            }
            return this.model.findById(_id);
        });
    }
    reportabuse(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: _id } = param;
            const updateObject = {
                abusedStatus: constant_1.constant.SUGGESTION_ABUSED_STATUS.REPORTED
            };
            yield this.model.findOneAndUpdate({ _id }, updateObject);
            return this.model.findById(_id);
        });
    }
    notifySubscribers(suggestionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db_user = this.getDBModel('User');
                const currentUserId = _.get(this.currentUser, '_id');
                const councilMember = yield db_user.findById(currentUserId);
                const suggestion = yield this.model.getDBInstance().findById(suggestionId)
                    .populate('subscribers.user', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL)
                    .populate('createdBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL);
                const toUsers = _.map(suggestion.subscribers, 'user') || [];
                toUsers.push(suggestion.createdBy);
                const toMails = _.map(toUsers, 'email');
                const subject = 'The suggestion is under consideration of Council.';
                const body = `
      <p>Council member ${utility_1.user.formatUsername(councilMember)} has marked this suggestion ${suggestion.title} as "Under Consideration"</p>
      <br />
      <p>Click this link to view more details: <a href="${process.env.SERVER_URL}/suggestion/${suggestion._id}">${process.env.SERVER_URL}/suggestion/${suggestion._id}</a></p>
      <br /> <br />
      <p>Thanks</p>
      <p>${process.env.SERVER_URL} Team</p>
    `;
                const recVariables = _.zipObject(toMails, _.map(toUsers, (user) => {
                    return {
                        _id: user._id,
                        username: utility_1.user.formatUsername(user)
                    };
                }));
                const mailObj = {
                    to: toMails,
                    subject,
                    body,
                    recVariables,
                };
                utility_1.mail.send(mailObj);
            }
            catch (error) {
                utility_1.logger.error(error);
            }
        });
    }
    notifyOwner(suggestionId, desc) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db_user = this.getDBModel('User');
                const currentUserId = _.get(this.currentUser, '_id');
                const councilMember = yield db_user.findById(currentUserId);
                const suggestion = yield this.model.getDBInstance().findById(suggestionId)
                    .populate('createdBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL);
                const toUsers = [suggestion.createdBy];
                const toMails = _.map(toUsers, 'email');
                const subject = 'Your suggestion needs more info for Council.';
                const body = `
        <p>Council member ${utility_1.user.formatUsername(councilMember)} has marked your suggestion ${suggestion.title} as "Need more information".</p>
        <br />
        <p>"${desc}"</p>
        <br />
        <p>Click this link to view more details: <a href="${process.env.SERVER_URL}/suggestion/${suggestion._id}">${process.env.SERVER_URL}/suggestion/${suggestion._id}</a></p>
        <br /> <br />
        <p>Thanks</p>
        <p>${process.env.SERVER_URL} Team</p>
      `;
                const recVariables = _.zipObject(toMails, _.map(toUsers, (user) => {
                    return {
                        _id: user._id,
                        username: utility_1.user.formatUsername(user)
                    };
                }));
                const mailObj = {
                    to: toMails,
                    subject,
                    body,
                    recVariables,
                };
                utility_1.mail.send(mailObj);
            }
            catch (error) {
                utility_1.logger.error(error);
            }
        });
    }
    addTag(param) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: _id, type, desc } = param;
                const currDoc = yield this.model.getDBInstance().findById(_id);
                if (!currDoc) {
                    throw 'Current document does not exist';
                }
                if (_.findIndex(currDoc.tags, (tagObj) => tagObj.type === type) !== -1)
                    return currDoc;
                const tag = {
                    type,
                    createdBy: _.get(this.currentUser, '_id'),
                };
                if (desc)
                    tag.desc = desc;
                const updateObject = {
                    $addToSet: { tags: tag }
                };
                yield this.model.findOneAndUpdate({ _id }, updateObject);
                if (type === constant_1.constant.SUGGESTION_TAG_TYPE.UNDER_CONSIDERATION) {
                    this.notifySubscribers(_id);
                }
                else if (type === constant_1.constant.SUGGESTION_TAG_TYPE.INFO_NEEDED) {
                    this.notifyOwner(_id, desc);
                }
                return this.model.findById(_id);
            }
            catch (error) {
                utility_1.logger.error(error);
            }
        });
    }
    abuse(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: _id } = param;
            const updateObject = {
                status: constant_1.constant.SUGGESTION_STATUS.ABUSED,
                abusedStatus: constant_1.constant.SUGGESTION_ABUSED_STATUS.HANDLED
            };
            yield this.model.findOneAndUpdate({ _id }, updateObject);
            return this.model.findById(_id);
        });
    }
    archive(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: _id } = param;
            const updateObject = {
                status: constant_1.constant.SUGGESTION_STATUS.ARCHIVED,
            };
            yield this.model.findOneAndUpdate({ _id }, updateObject);
            return this.model.findById(_id);
        });
    }
    delete(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: _id } = param;
            return this.model.findByIdAndDelete(_id);
        });
    }
    validateTitle(title) {
        if (!utility_1.validate.valid_string(title, 4)) {
            throw 'invalid title';
        }
    }
    validateDesc(desc) {
        if (!utility_1.validate.valid_string(desc, 1)) {
            throw 'invalid description';
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=SuggestionService.js.map