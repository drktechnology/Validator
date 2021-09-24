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
const sanitize = '-password -salt -email -resetToken';
const sanitizeWithEmail = '-password -salt -resetToken';
class default_1 extends Base_1.default {
    create(type, param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { comment, headline, createdBy, id, returnUrl } = param;
            const createdAt = param.createdAt || new Date();
            const db_commentable = this.getDBModel(type);
            let commentable = yield db_commentable.getDBInstance().findOne({ _id: id })
                .populate('createdBy')
                .populate('owner')
                .populate('subscribers', sanitizeWithEmail);
            if (commentable) {
                const updateObj = {
                    comments: commentable.comments || [],
                    subscribers: commentable.subscribers || []
                };
                updateObj.comments.push({
                    comment,
                    headline,
                    createdBy: this.currentUser,
                    createdAt
                });
                if (!_.isUndefined(commentable.commentsNum))
                    updateObj.commentsNum = updateObj.comments.length;
                if (!_.isUndefined(commentable.activeness))
                    updateObj.activeness = commentable.activeness + 1;
                const mentions = comment.match(/@\w+/g);
                if (mentions) {
                    this.sendMentionEmails(type, param, createdBy, mentions, returnUrl, commentable.name);
                }
                if (commentable.subscribers) {
                    this.sendSubscriberEmails(type, param, createdBy, commentable.subscribers, returnUrl, commentable.name);
                }
                if (commentable.createdBy) {
                    this.sendNotificationEmail(type, param, createdBy, commentable.createdBy, undefined, returnUrl, commentable.name);
                    if (!_.map(commentable.subscribers, (sub) => sub.user._id.toString()).includes(this.currentUser._id.toString())) {
                        if (commentable.createdBy._id.toString() !== this.currentUser._id.toString()) {
                            updateObj.subscribers.push({
                                user: this.currentUser,
                                lastSeen: new Date()
                            });
                        }
                    }
                }
                else if (commentable.owner) {
                    this.sendNotificationEmail(type, param, createdBy, commentable.owner, undefined, returnUrl, commentable.name);
                }
                else if (type === 'Task_Candidate') {
                    commentable = yield db_commentable.getDBInstance().findOne({ _id: id })
                        .populate('createdBy')
                        .populate('user');
                    const db_task = this.getDBModel('Task');
                    const task = yield db_task.getDBInstance().findOne({ _id: commentable.task.toString() })
                        .populate('createdBy');
                    this.sendNotificationEmail('Application', param, createdBy, task.createdBy, commentable.user, returnUrl, undefined);
                }
                else if (type === 'User_Team') {
                    commentable = yield db_commentable.getDBInstance().findOne({ _id: id })
                        .populate('user');
                    const db_team = this.getDBModel('Team');
                    const team = yield db_team.getDBInstance().findOne({ _id: commentable.team })
                        .populate('owner');
                    this.sendNotificationEmail('Application', param, createdBy, team.owner, commentable.user, returnUrl, undefined);
                }
                else if (type === 'User') {
                    commentable = yield db_commentable.getDBInstance().findOne({ _id: id });
                    this.sendNotificationEmail('Profile', param, createdBy, commentable, undefined, returnUrl, undefined);
                }
                return yield db_commentable.update({ _id: id }, updateObj);
            }
            else {
                throw 'commentable id is not valid';
            }
        });
    }
    subscribe(type, param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = param;
            const db_commentable = this.getDBModel(type);
            const commentable = yield db_commentable.getDBInstance().findOne({ _id: id })
                .populate('createdBy');
            if (commentable) {
                if (_.map(commentable.subscribers, (sub) => sub.user.toString()).includes(this.currentUser._id.toString())) {
                    return;
                }
                const updateObj = {
                    subscribers: commentable.subscribers || []
                };
                updateObj.subscribers.push({
                    user: this.currentUser,
                    lastSeen: new Date()
                });
                return yield db_commentable.update({ _id: id }, updateObj);
            }
            else {
                throw 'commentable id is not valid';
            }
        });
    }
    unsubscribe(type, param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = param;
            const db_commentable = this.getDBModel(type);
            const commentable = yield db_commentable.getDBInstance().findOne({ _id: id })
                .populate('createdBy')
                .populate('subscribers', sanitize);
            if (commentable) {
                const updateObj = {
                    subscribers: commentable.subscribers || []
                };
                updateObj.subscribers = _.filter(updateObj.subscribers, (subscriber) => {
                    return subscriber.user && subscriber.user._id.toString() !== this.currentUser._id.toString();
                });
                return yield db_commentable.update({ _id: id }, updateObj);
            }
            else {
                throw 'commentable id is not valid';
            }
        });
    }
    sendNotificationEmail(type, param, curUser, owner, notifier, returnUrl, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (curUser.current_user_id === owner._id.toString() && !notifier) {
                return;
            }
            const { comment } = param;
            let ownerSubject = `Someone has commented on your ${type}`;
            let ownerBody = '';
            if (name) {
                ownerBody = `In ${name}, `;
            }
            ownerBody += `
            ${curUser.profile.firstName} ${curUser.profile.lastName} says:<br/>${comment}
            <br/>
            <br/>
            <a href="${process.env.SERVER_URL}${returnUrl}">Click here to view the ${type}</a>
        `;
            const recipient = notifier || owner;
            let ownerTo = recipient.email;
            let ownerToName = `${recipient.profile.firstName} ${recipient.profile.lastName}`;
            yield utility_1.mail.send({
                to: ownerTo,
                toName: ownerToName,
                subject: ownerSubject,
                body: ownerBody
            });
        });
    }
    sendMentionEmails(type, param, curUser, mentions, returnUrl, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const { comment } = param;
            let ownerSubject = `Someone has commented on your ${type}`;
            let ownerBody = '';
            if (name) {
                ownerBody = `In ${name}, `;
            }
            ownerBody += `${curUser.profile.firstName} ${curUser.profile.lastName} says:<br/>${comment}
            <a href="${process.env.SERVER_URL}${returnUrl}">Click here to view the ${type}</a>`;
            const seenEmails = {};
            for (let mention of mentions) {
                const username = mention.replace('@', '').split(' ')[0];
                if (_.includes(mentions, '@ALL')) {
                    const db_user = this.getDBModel('User');
                    const query = { role: constant_1.constant.USER_ROLE.COUNCIL };
                    const councilMembers = yield db_user.getDBInstance().find(query);
                    _.map(councilMembers, user => {
                        utility_1.mail.send({
                            to: user.email,
                            toName: utility_1.user.formatUsername(user),
                            subject: ownerSubject,
                            body: ownerBody
                        });
                    });
                    return;
                }
                const db_user = this.getDBModel('User');
                const user = yield db_user.findOne({ username });
                if (curUser.current_user_id === user._id) {
                    return;
                }
                let ownerTo = user.email;
                let ownerToName = `${user.profile.firstName} ${user.profile.lastName}`;
                if (seenEmails[ownerTo]) {
                    continue;
                }
                yield utility_1.mail.send({
                    to: ownerTo,
                    toName: ownerToName,
                    subject: ownerSubject,
                    body: ownerBody
                });
                seenEmails[ownerTo] = true;
            }
        });
    }
    sendSubscriberEmails(type, param, curUser, subscribers, returnUrl, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const { comment } = param;
            let ownerSubject = `Someone has commented on a ${type} you subscribed to`;
            let ownerBody = '';
            if (name) {
                ownerBody = `In ${name}, `;
            }
            ownerBody += `
            ${curUser.profile.firstName} ${curUser.profile.lastName} says:<br/>${comment}
            <br/>
            <br/>
            <a href="${process.env.SERVER_URL}${returnUrl}">Click here to view the ${type}</a>
        `;
            const seenEmails = {};
            for (let subscriber of subscribers) {
                if (curUser.current_user_id === subscriber.user._id) {
                    return;
                }
                let ownerTo = subscriber.user.email;
                let ownerToName = `${subscriber.user.profile.firstName} ${subscriber.user.profile.lastName}`;
                if (seenEmails[ownerTo]) {
                    continue;
                }
                yield utility_1.mail.send({
                    to: ownerTo,
                    toName: ownerToName,
                    subject: ownerSubject,
                    body: ownerBody
                });
                seenEmails[ownerTo] = true;
            }
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=CommentService.js.map