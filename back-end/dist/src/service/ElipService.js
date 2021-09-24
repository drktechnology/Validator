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
    update(param) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db_elip = this.getDBModel('Elip');
                const { _id, status } = param;
                const elip = yield db_elip
                    .getDBInstance()
                    .findOne({ _id })
                    .populate('createdBy');
                if (!elip) {
                    throw 'ElipService.update - invalid elip id';
                }
                if (!elip.createdBy._id.equals(this.currentUser._id)) {
                    throw 'ElipService.update - current user is not the author of elip';
                }
                const { title, description } = param;
                const doc = { status };
                if (title) {
                    doc.title = title;
                }
                if (description) {
                    doc.description = description;
                }
                const rs = yield db_elip.update({ _id }, doc);
                this.notifySecretaries(elip);
                return rs;
            }
            catch (error) {
                utility_1.logger.error(error);
                return;
            }
        });
    }
    create(param) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db_elip = this.getDBModel('Elip');
                const { title, description } = param;
                const vid = yield this.getNewVid();
                const doc = {
                    title,
                    vid,
                    description,
                    status: constant_1.constant.ELIP_STATUS.WAIT_FOR_REVIEW,
                    contentType: constant_1.constant.CONTENT_TYPE.MARKDOWN,
                    createdBy: this.currentUser._id
                };
                const elip = yield db_elip.save(doc);
                this.notifySecretaries(elip);
                return elip;
            }
            catch (error) {
                utility_1.logger.error(error);
                return;
            }
        });
    }
    getNewVid() {
        return __awaiter(this, void 0, void 0, function* () {
            const db_elip = this.getDBModel('Elip');
            const n = yield db_elip.count({});
            return n + 1;
        });
    }
    notifySecretaries(elip) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            const currentUserId = _.get(this.currentUser, '_id');
            const secretaries = yield db_user.find({
                role: constant_1.constant.USER_ROLE.SECRETARY
            });
            const toUsers = _.filter(secretaries, user => !user._id.equals(currentUserId));
            const toMails = _.map(toUsers, 'email');
            const subject = `New ELIP created`;
            const body = `
      <p>This is a new ${elip.title} added and to be reviewed:</p>
      <br />
      <p>Click this link to view more details: <a href="${process.env.SERVER_URL}/elips/${elip._id}">${process.env.SERVER_URL}/elips/${elip._id}</a></p>
      <br />
      <p>${process.env.SERVER_URL} Team</p>
      <p>Thanks</p>
    `;
            const recVariables = _.zipObject(toMails, _.map(toUsers, user => {
                return {
                    _id: user._id,
                    username: utility_1.user.formatUsername(user)
                };
            }));
            const mailObj = {
                to: toMails,
                subject,
                body,
                recVariables
            };
            utility_1.mail.send(mailObj);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_elip = this.getDBModel('Elip');
            const rs = yield db_elip
                .getDBInstance()
                .findById({ _id: id })
                .populate('createdBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME);
            if (!rs) {
                throw 'ElipService.getById - invalid elip id';
            }
            const db_elip_review = this.getDBModel('Elip_Review');
            const reviews = yield db_elip_review
                .getDBInstance()
                .find({ elipId: id })
                .populate('createdBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME);
            const currentUserId = _.get(this.currentUser, '_id');
            const userRole = _.get(this.currentUser, 'role');
            const isVisible = [constant_1.constant.ELIP_STATUS.DRAFT, constant_1.constant.ELIP_STATUS.SUBMITTED].includes(rs.status) ||
                rs.createdBy._id.equals(currentUserId) ||
                userRole === constant_1.constant.USER_ROLE.SECRETARY;
            if (_.isEmpty(rs.comments)) {
                return isVisible ? { elip: rs, reviews } : {};
            }
            for (const comment of rs.comments) {
                for (const thread of comment) {
                    yield db_elip.getDBInstance().populate(thread, {
                        path: 'createdBy',
                        select: `${constant_1.constant.DB_SELECTED_FIELDS.USER.NAME} profile.avatar`
                    });
                }
            }
            return isVisible ? { elip: rs, reviews } : {};
        });
    }
    list(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_elip = this.getDBModel('Elip');
            const currentUserId = _.get(this.currentUser, '_id');
            const userRole = _.get(this.currentUser, 'role');
            const query = {};
            if (!this.isLoggedIn()) {
                query.status = { $in: [constant_1.constant.ELIP_STATUS.DRAFT, constant_1.constant.ELIP_STATUS.SUBMITTED] };
            }
            if (param.filter === constant_1.constant.ELIP_FILTER.DRAFT) {
                query.status = constant_1.constant.ELIP_STATUS.DRAFT;
            }
            if (param.filter === constant_1.constant.ELIP_FILTER.SUBMITTED_BY_ME) {
                query.createdBy = currentUserId;
                query.status = constant_1.constant.ELIP_STATUS.SUBMITTED;
            }
            if (param.filter === constant_1.constant.ELIP_FILTER.WAIT_FOR_REVIEW) {
                query.status = constant_1.constant.ELIP_STATUS.WAIT_FOR_REVIEW;
            }
            if (this.isLoggedIn() &&
                userRole !== constant_1.constant.USER_ROLE.SECRETARY &&
                param.filter === constant_1.constant.ELIP_FILTER.ALL) {
                query.$or = [
                    { createdBy: currentUserId,
                        status: { $in: [constant_1.constant.ELIP_STATUS.REJECTED, constant_1.constant.ELIP_STATUS.WAIT_FOR_REVIEW] }
                    },
                    { status: { $in: [constant_1.constant.ELIP_STATUS.DRAFT, constant_1.constant.ELIP_STATUS.SUBMITTED] } }
                ];
            }
            if (param.$or && query.$or) {
                query.$and = [
                    { $or: query.$or },
                    { $or: param.$or }
                ];
            }
            if (param.$or && !query.$or) {
                query.$or = param.$or;
            }
            const fields = 'vid title createdBy createdAt status';
            const list = yield db_elip.getDBInstance()
                .find(query, fields)
                .populate('createdBy', constant_1.constant.DB_SELECTED_FIELDS.USER.NAME)
                .sort({ vid: -1 })
                .limit(100);
            return list;
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=ElipService.js.map