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
class default_1 extends Base_1.default {
    init() {
        this.model = this.getDBModel('CVote_Summary');
    }
    create(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { content, proposalId, status } = param;
            const doc = {
                content,
                proposalId,
                status: constant_1.constant.CVOTE_SUMMARY_STATUS.REVIEWING,
                createdBy: this.currentUser._id
            };
            if (status === constant_1.constant.CVOTE_SUMMARY_STATUS.DRAFT) {
                doc.status = status;
            }
            try {
                const rs = yield this.model.save(doc);
                if (rs.status === constant_1.constant.CVOTE_SUMMARY_STATUS.REVIEWING) {
                    const proposal = yield this.getProposalById(proposalId);
                    if (proposal)
                        this.notifySecretary(proposal);
                }
                return rs;
            }
            catch (error) {
                console.log(error);
                return;
            }
        });
    }
    update(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: _id, content, status } = param;
            if (!this.currentUser || !this.currentUser._id) {
                throw 'CVoteSummaryService.updateDraft - invalid current user';
            }
            const cur = yield this.model.findOne({ _id });
            if (!cur) {
                throw 'CVoteSummaryService.updateDraft - invalid id';
            }
            if (cur.status !== constant_1.constant.CVOTE_SUMMARY_STATUS.DRAFT) {
                throw 'CVoteSummaryService.updateDraft - only DRAFT can be updated';
            }
            if (!this.isOwner(cur)) {
                throw 'CVoteSummaryService.updateDraft - not owner';
            }
            const doc = {
                content
            };
            if (status && _.includes([constant_1.constant.CVOTE_SUMMARY_STATUS.DRAFT, constant_1.constant.CVOTE_SUMMARY_STATUS.REVIEWING], status)) {
                doc.status = status;
            }
            try {
                yield this.model.update({ _id }, doc);
                if (status === constant_1.constant.CVOTE_SUMMARY_STATUS.REVIEWING) {
                    const proposal = yield this.getProposalById(cur.proposalId);
                    if (proposal)
                        this.notifySecretary(proposal);
                }
                return yield this.getById(_id);
            }
            catch (error) {
                console.log('error happened: ', error);
                return;
            }
        });
    }
    list(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { proposalId } = param;
            const proposal = yield this.getProposalById(proposalId);
            if (!proposalId || !proposal) {
                throw 'CVoteSummaryService.list - invalid proposal';
            }
            const query = {
                proposalId,
            };
            const cursor = this.model.getDBInstance().find(query)
                .populate('comment.createdBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME)
                .sort({ createdAt: 1 });
            const totalCursor = this.model.getDBInstance().find(query).count();
            const list = yield cursor;
            const total = yield totalCursor;
            return {
                list,
                total
            };
        });
    }
    listPublic(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { proposalId } = param;
            if (!proposalId) {
                throw 'CVoteSummaryService.list - must specify a proposal id';
            }
            const query = {
                proposalId,
                status: constant_1.constant.CVOTE_SUMMARY_STATUS.PUBLISHED,
            };
            const cursor = this.model.getDBInstance().find(query).sort({
                createdAt: 1
            });
            const totalCursor = this.model.getDBInstance().find(query).count();
            const list = yield cursor;
            const total = yield totalCursor;
            return {
                list,
                total,
            };
        });
    }
    approve(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = param;
            const cur = yield this.getById(id);
            const createdBy = _.get(this.currentUser, '_id');
            if (!cur) {
                throw 'invalid id';
            }
            if (cur.status !== constant_1.constant.CVOTE_SUMMARY_STATUS.REVIEWING) {
                throw 'CVoteSummaryService.updateDraft - only REVIEWING can be updated';
            }
            yield this.model.update({ _id: id }, {
                $set: {
                    status: constant_1.constant.CVOTE_SUMMARY_STATUS.PUBLISHED,
                    comment: {
                        createdBy,
                    }
                }
            });
            const proposal = yield this.getProposalById(cur.proposalId);
            if (proposal)
                this.notifyApproved(proposal);
            const db_cvote = this.getDBModel('CVote');
            yield db_cvote.update({ _id: cur.proposalId }, {
                $set: {
                    status: constant_1.constant.CVOTE_STATUS.FINAL
                }
            });
            return yield this.getById(id);
        });
    }
    reject(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, comment } = param;
            const cur = yield this.getById(id);
            const createdBy = _.get(this.currentUser, '_id');
            if (!cur) {
                throw 'CVoteSummaryService.reject - invalid id';
            }
            if (cur.status !== constant_1.constant.CVOTE_SUMMARY_STATUS.REVIEWING) {
                throw 'CVoteSummaryService.reject - only REVIEWING can be updated';
            }
            if (!comment) {
                throw 'CVoteSummaryService.reject - comment is required';
            }
            yield this.model.update({ _id: id }, {
                $set: {
                    status: constant_1.constant.CVOTE_SUMMARY_STATUS.REJECT,
                    comment: {
                        content: comment,
                        createdBy,
                    }
                }
            });
            const proposal = yield this.getProposalById(cur.proposalId);
            if (proposal)
                this.notifyRejected(proposal);
            return yield this.getById(id);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.getDBInstance().findOne({ _id: id });
        });
    }
    getProposalById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getDBModel('CVote').getDBInstance().findOne({ _id: id });
        });
    }
    notifyUsers(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subject, body, user, role } = param;
            const db_user = this.getDBModel('User');
            const currentUserId = _.get(this.currentUser, '_id');
            const receivers = user ? [user] : yield db_user.find({ role });
            const toUsers = _.filter(receivers, user => (user._id && user._id.toString()) !== currentUserId);
            const toMails = _.map(toUsers, 'email');
            const recVariables = _.zipObject(toMails, _.map(toUsers, (user) => ({
                _id: user._id,
                username: utility_1.user.formatUsername(user)
            })));
            const mailObj = {
                to: toMails,
                subject,
                body,
                recVariables,
            };
            utility_1.mail.send(mailObj);
        });
    }
    notifySecretary(cvote) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = `[Review needed] Summary is updated in Prop #${cvote.vid}`;
            const body = `
      <p>${cvote.proposedBy} has updated the summary in proposal #${cvote.vid}</p>
      <br />
      <p>Click this link to view more details: <a href="${process.env.SERVER_URL}/proposals/${cvote._id}">${process.env.SERVER_URL}/proposals/${cvote._id}</a></p>
      <br /> <br />
      <p>Thanks</p>
      <p>${process.env.SERVER_URL} Team</p>
    `;
            const mailObj = {
                subject,
                body,
                role: constant_1.constant.USER_ROLE.SECRETARY,
            };
            this.notifyUsers(mailObj);
        });
    }
    notifyRejected(cvote) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = `[Summary Rejected] Please respond in Prop #${cvote.vid}`;
            const body = `
      <p>Your summary update has been rejected in proposal #${cvote.vid}</p>
      <br />
      <p>Click this link to view more details: <a href="${process.env.SERVER_URL}/proposals/${cvote._id}">${process.env.SERVER_URL}/proposals/${cvote._id}</a></p>
      <br /> <br />
      <p>Thanks</p>
      <p>${process.env.SERVER_URL} Team</p>
    `;
            const user = yield this.getDBModel('User').getDBInstance().findOne({ _id: cvote.proposer });
            const mailObj = {
                subject,
                body,
                user,
            };
            this.notifyUsers(mailObj);
        });
    }
    notifyApproved(cvote) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = `[Summary approved] Approved in Prop #${cvote.vid}`;
            const body = `
      <p>Your summary update has been approved and published in proposal #${cvote.vid}</p>
      <br />
      <p>Click this link to view more details: <a href="${process.env.SERVER_URL}/proposals/${cvote._id}">${process.env.SERVER_URL}/proposals/${cvote._id}</a></p>
      <br /> <br />
      <p>Thanks</p>
      <p>${process.env.SERVER_URL} Team</p>
    `;
            const user = yield this.getDBModel('User').getDBInstance().findOne({ _id: cvote.proposer });
            const mailObj = {
                subject,
                body,
                user,
            };
            this.notifyUsers(mailObj);
        });
    }
    isOwner(doc) {
        const userId = _.get(this.currentUser, '_id', '');
        return userId.toString() === _.get(doc, 'createdBy').toString();
    }
}
exports.default = default_1;
//# sourceMappingURL=CVoteSummaryService.js.map