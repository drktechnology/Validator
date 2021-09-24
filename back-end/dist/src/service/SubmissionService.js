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
const restrictedFields = {
    update: [
        '_id',
        'submissionId',
        'createdBy'
    ]
};
const sanitize = '-password -salt -email -resetToken';
class default_1 extends Base_1.default {
    show(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_submission = this.getDBModel('Submission');
            let submission;
            if (param.submissionId) {
                submission = yield db_submission.getDBInstance().findOne({ _id: param.submissionId })
                    .populate('createdBy', sanitize)
                    .populate('community')
                    .populate('subscribers', sanitize);
            }
            else if (this.currentUser && param.campaign) {
                submission = yield db_submission.getDBInstance().findOne({ createdBy: this.currentUser._id, campaign: param.campaign })
                    .populate('createdBy', sanitize)
                    .populate('community')
                    .populate('subscribers', sanitize);
            }
            if (submission) {
                for (let comment of submission.comments) {
                    for (let thread of comment) {
                        yield db_submission.getDBInstance().populate(thread, {
                            path: 'createdBy',
                            select: sanitize
                        });
                    }
                }
                yield this.markLastSeenComment(submission, submission.createdBy, db_submission);
            }
            return submission;
        });
    }
    list(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_submission = this.getDBModel('Submission');
            const db_user = this.getDBModel('User');
            const submissions = yield db_submission.list(query, {
                updatedAt: -1
            });
            for (let submission of submissions) {
                for (let subscriber of submission.subscribers) {
                    yield db_user.getDBInstance().populate(subscriber, {
                        path: 'user',
                        select: sanitize
                    });
                }
                yield db_submission.getDBInstance().populate(submission, {
                    path: 'createdBy',
                    select: sanitize
                });
                yield db_submission.getDBInstance().populate(submission, ['community']);
                for (let comment of submission.comments) {
                    for (let thread of comment) {
                        yield db_submission.getDBInstance().populate(thread, {
                            path: 'createdBy',
                            select: sanitize
                        });
                    }
                }
            }
            return submissions;
        });
    }
    create(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type, campaign, title, description, community, state, city, email, fullLegalName, dob, occupation, education, location, audienceInfo, publicSpeakingExp, eventOrganizingExp, previousExp, isDeveloper, devBackground, reason, suitedReason, attachment, attachmentType, attachmentFilename, passportUpload, passportUploadType, passportFilename } = param;
            this.validate_title(title);
            this.validate_type(type);
            const submission = {
                type,
                campaign,
                title,
                description,
                community,
                state,
                city,
                occupation,
                education,
                location,
                dob,
                email,
                fullLegalName,
                audienceInfo,
                publicSpeakingExp,
                previousExp,
                eventOrganizingExp,
                isDeveloper,
                devBackground,
                reason,
                suitedReason,
                attachment,
                attachmentType,
                attachmentFilename,
                passportUpload,
                passportUploadType,
                passportFilename,
                createdBy: this.currentUser ? this.currentUser._id : undefined
            };
            const db_submission = this.getDBModel('Submission');
            return yield db_submission.save(submission);
        });
    }
    validate_title(title) {
        if (!utility_1.validate.valid_string(title, 1)) {
            throw 'invalid submission title';
        }
    }
    validate_description(description) {
        if (!utility_1.validate.valid_string(description, 1)) {
            throw 'invalid submission description';
        }
    }
    validate_type(type) {
        if (!type) {
            throw 'submission type is empty';
        }
        if (!_.includes(constant_1.constant.SUBMISSION_TYPE, type)) {
            throw 'submission type is not valid';
        }
    }
    update(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { submissionId, type, description } = param;
            const db_submission = this.getDBModel('Submission');
            const updateObj = _.omit(param, restrictedFields.update);
            yield db_submission.update({ _id: submissionId }, updateObj);
            return db_submission.findById(submissionId);
        });
    }
    archive(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_submission = this.getDBModel('Submission');
            const submissionId = param.submissionId;
            const submission = yield db_submission.findById(submissionId);
            if (!submission) {
                throw 'submission not found';
            }
            const updateObj = {
                archived: true
            };
            yield db_submission.update({ _id: submissionId }, updateObj);
            return db_submission.findById(submissionId);
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=SubmissionService.js.map