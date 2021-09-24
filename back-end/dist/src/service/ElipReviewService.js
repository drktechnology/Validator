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
const constant_1 = require("../constant");
const utility_1 = require("../utility");
class default_1 extends Base_1.default {
    create(param) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db_elip_review = this.getDBModel('Elip_Review');
                const db_elip = this.getDBModel('Elip');
                const { elipId } = param;
                const elip = yield db_elip
                    .getDBInstance()
                    .findById({ _id: elipId })
                    .populate('createdBy');
                if (!elip) {
                    throw 'ElipReviewService.create - invalid elip id';
                }
                const user = this.currentUser;
                const { comment, status } = param;
                const doc = {
                    comment,
                    status,
                    createdBy: user._id,
                    elipId
                };
                const review = yield db_elip_review.save(doc);
                const elipStatus = status === constant_1.constant.ELIP_REVIEW_STATUS.REJECTED ? constant_1.constant.ELIP_STATUS.REJECTED : constant_1.constant.ELIP_STATUS.DRAFT;
                yield db_elip.update({ _id: elipId }, { status: elipStatus });
                this.notifyElipCreator(review, elip, status);
                const createdBy = {
                    _id: user._id,
                    profile: { firstName: user.firstName, lastName: user.lastName },
                    username: user.username
                };
                return Object.assign(Object.assign({}, review._doc), { createdBy, elipStatus });
            }
            catch (error) {
                utility_1.logger.error(error);
                return;
            }
        });
    }
    notifyElipCreator(review, elip, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const rejected = status === constant_1.constant.ELIP_REVIEW_STATUS.REJECTED;
            const subject = rejected ? 'ELIP Rejected' : 'ELIP Approved';
            const body = `
      <p>CR secretary has marked your ELIP <${elip.title}> as "${rejected ? 'Rejected' : 'Approved'}", ID <#${elip.vid}>.</p>
      <br />
      ${rejected ? `<p>${review.comment}<p>` : ''}
      <br />
      <p>Click this link to view more details: <a href="${process.env.SERVER_URL}/elips/${elip._id}">${process.env.SERVER_URL}/elips/${elip._id}</a></p>
      <br />
      <p>${process.env.SERVER_URL} Team</p>
      <p>Thanks</p>
    `;
            const mailObj = {
                to: elip.createdBy.email,
                toName: utility_1.user.formatUsername(elip.createdBy),
                subject,
                body
            };
            utility_1.mail.send(mailObj);
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=ElipReviewService.js.map