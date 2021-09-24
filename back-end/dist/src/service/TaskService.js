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
const mongoose_1 = require("mongoose");
const _ = require("lodash");
const constant_1 = require("../constant");
const utility_1 = require("../utility");
const ObjectId = mongoose_1.Types.ObjectId;
const restrictedFields = {
    update: [
        '_id',
        'taskId',
        'status',
        'password'
    ]
};
const sanitize = '-password -salt -email -resetToken';
class default_1 extends Base_1.default {
    show(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_task = this.getDBModel('Task');
            const db_task_candidate = this.getDBModel('Task_Candidate');
            const db_user = this.getDBModel('User');
            const db_team = this.getDBModel('Team');
            const task = yield db_task.getDBInstance().findOne({ _id: param.taskId })
                .populate('candidates', sanitize)
                .populate('subscribers', sanitize)
                .populate('createdBy', sanitize)
                .populate('approvedBy', sanitize)
                .populate('community')
                .populate('communityParent')
                .populate('circle');
            if (task) {
                for (let subscriber of task.subscribers) {
                    yield db_user.getDBInstance().populate(subscriber, {
                        path: 'user',
                        select: sanitize
                    });
                }
                for (let comment of task.comments) {
                    for (let thread of comment) {
                        yield db_task.getDBInstance().populate(thread, {
                            path: 'createdBy',
                            select: sanitize
                        });
                    }
                }
                for (let candidate of task.candidates) {
                    yield db_user.getDBInstance().populate(candidate, {
                        path: 'user',
                        select: sanitize
                    });
                    yield db_team.getDBInstance().populate(candidate, {
                        path: 'team'
                    });
                    if (candidate.team) {
                        yield db_user.getDBInstance().populate(candidate.team, {
                            path: 'owner',
                            select: sanitize
                        });
                        yield db_team.getDBInstance().populate(candidate.team, ['members']);
                    }
                    for (let comment of candidate.comments) {
                        for (let thread of comment) {
                            yield db_task.getDBInstance().populate(thread, {
                                path: 'createdBy',
                                select: sanitize
                            });
                        }
                    }
                }
                yield this.markLastSeenComment(task, task.createdBy, db_task);
            }
            return task;
        });
    }
    markCandidateVisited(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { taskCandidateId, owner } = param;
            const db_task_candidate = this.getDBModel('Task_Candidate');
            const updateObj = owner
                ? { lastSeenByOwner: new Date() }
                : { lastSeenByCandidate: new Date() };
            yield db_task_candidate.update({ _id: taskCandidateId }, updateObj);
            const updatedTask = db_task_candidate.findById(taskCandidateId);
            return updatedTask;
        });
    }
    markComplete(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { taskCandidateId } = param;
            const db_task_candidate = this.getDBModel('Task_Candidate');
            const updateObj = { complete: true };
            yield db_task_candidate.update({ _id: taskCandidateId }, updateObj);
            const updatedTask = db_task_candidate.findById(taskCandidateId);
            return updatedTask;
        });
    }
    list(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_task = this.getDBModel('Task');
            const db_task_candidate = this.getDBModel('Task_Candidate');
            const db_user = this.getDBModel('User');
            const db_team = this.getDBModel('Team');
            const db_user_team = this.getDBModel('User_Team');
            const cursor = db_task.getDBInstance().find(_.omit(param, ['results', 'page', 'sortBy', 'sortOrder']));
            if (param.sortBy) {
                const sortObject = {};
                sortObject[param.sortBy] = _.get(constant_1.constant.SORT_ORDER, param.sortOrder, constant_1.constant.SORT_ORDER.DESC);
                cursor.sort(sortObject);
            }
            if (param.results) {
                const results = parseInt(param.results, 10);
                const page = parseInt(param.page, 10);
                cursor.skip(results * (page - 1)).limit(results);
            }
            const tasks = yield cursor;
            if (tasks.length) {
                for (const task of tasks) {
                    yield db_task.getDBInstance().populate(task, {
                        path: 'createdBy',
                        select: sanitize,
                    });
                    yield db_task.getDBInstance().populate(task, {
                        path: 'approvedBy',
                        select: sanitize,
                    });
                    yield db_task.getDBInstance().populate(task, [
                        'community',
                        'communityParent',
                    ]);
                    yield db_task.getDBInstance().populate(task, {
                        path: 'candidates',
                        select: sanitize,
                    });
                    yield db_team.getDBInstance().populate(task, {
                        path: 'circle',
                        select: sanitize,
                    });
                    for (const subscriber of task.subscribers) {
                        yield db_user.getDBInstance().populate(subscriber, {
                            path: 'user',
                            select: sanitize
                        });
                    }
                    for (const comment of task.comments) {
                        for (const thread of comment) {
                            yield db_task.getDBInstance().populate(thread, {
                                path: 'createdBy',
                                select: sanitize
                            });
                        }
                    }
                    for (const candidate of task.candidates) {
                        yield db_task_candidate.getDBInstance().populate(candidate, {
                            path: 'user',
                            select: sanitize
                        });
                        yield db_task_candidate.getDBInstance().populate(candidate, ['team']);
                        if (candidate.team) {
                            yield db_team.getDBInstance().populate(candidate.team, ['members']);
                        }
                    }
                }
            }
            return tasks;
        });
    }
    create(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, descBreakdown, goals, circle, thumbnail, infoLink, community, communityParent, category, type, startTime, endTime, candidateLimit, candidateSltLimit, rewardUpfront, reward, assignSelf, applicationDeadline, completionDeadline, eventDateRange, eventDateRangeStart, eventDateRangeEnd, eventDateStatus, location, attachment, attachmentType, attachmentFilename, isUsd, readDisclaimer, domain, recruitedSkillsets, pictures, pitch, bidding, referenceBid } = param;
            this.validate_name(name);
            this.validate_description(description);
            this.validate_type(type);
            let status = constant_1.constant.TASK_STATUS.CREATED;
            if (rewardUpfront.ela > 0 || reward.ela > 0 || rewardUpfront.usd > 0 || reward.usd > 0) {
                if (this.currentUser.role !== constant_1.constant.USER_ROLE.ADMIN) {
                    status = constant_1.constant.TASK_STATUS.PENDING;
                }
                else {
                    status = constant_1.constant.TASK_STATUS.APPROVED;
                }
            }
            else {
                if (assignSelf) {
                    status = constant_1.constant.TASK_STATUS.APPROVED;
                }
            }
            const doc = {
                name, description, descBreakdown, goals, infoLink, category, type, circle,
                startTime,
                endTime,
                thumbnail,
                domain,
                recruitedSkillsets,
                pictures,
                readDisclaimer,
                applicationDeadline, completionDeadline,
                eventDateRange, eventDateRangeStart, eventDateRangeEnd, eventDateStatus,
                location,
                bidding,
                referenceBid,
                attachment, attachmentType, attachmentFilename,
                candidateLimit,
                candidateSltLimit,
                pitch,
                rewardUpfront: rewardUpfront,
                reward: reward,
                assignSelf: assignSelf,
                status: status,
                createdBy: this.currentUser._id
            };
            if (community) {
                doc['community'] = community;
            }
            if (communityParent) {
                doc['communityParent'] = communityParent;
            }
            if (assignSelf) {
                doc.candidateLimit = 1;
                doc.candidateSltLimit = 1;
            }
            const db_task = this.getDBModel('Task');
            const task = yield db_task.save(doc);
            this.sendCreateEmail(this.currentUser, task);
            if (assignSelf) {
                yield this.addCandidate({ taskId: task._id, userId: this.currentUser._id, assignSelf: true });
            }
            if (circle) {
                this.sendNewCircleTaskNotification(circle, task);
            }
            return task;
        });
    }
    update(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { taskId, rewardUpfront, reward } = param;
            let sendTaskPendingRequiredApprovalEmail = false;
            if (param.status === constant_1.constant.TASK_STATUS.ASSIGNED) {
                throw 'Assigned Status is Deprecated';
            }
            if (this.currentUser.role === constant_1.constant.USER_ROLE.LEADER) {
                if ([
                    constant_1.constant.TASK_STATUS.DISTRIBUTED,
                    constant_1.constant.TASK_STATUS.CANCELED,
                    constant_1.constant.TASK_STATUS.APPROVED
                ].includes(param.status)) {
                    throw 'Access Denied - Status';
                }
            }
            const db_task = this.getDBModel('Task');
            const db_user = this.getDBModel('User');
            const task = yield db_task.findById(taskId);
            const taskOwner = yield db_user.findById(task.createdBy);
            yield db_task.getDBInstance().populate(task, {
                path: 'candidates',
                select: sanitize,
            });
            let sendTaskMarkedAsCompleteEmail = false;
            if (this.currentUser.role === constant_1.constant.USER_ROLE.MEMBER) {
                if (!_.includes([constant_1.constant.TASK_STATUS.CREATED, constant_1.constant.TASK_STATUS.PENDING], task.status)) {
                    if (this.isTaskAssignee(task) && _.keys(param).length === 2 && !!param.taskId && param.status === constant_1.constant.TASK_STATUS.SUBMITTED) {
                        sendTaskMarkedAsCompleteEmail = true;
                    }
                    else {
                        throw 'Access Denied - Owners cant edit tasks past PENDING';
                    }
                }
                else if (this.currentUser._id.toString() !== task.createdBy.toString()) {
                    throw 'Access Denied';
                }
            }
            const updateObj = _.omit(param, restrictedFields.update);
            if (this.currentUser.role === constant_1.constant.USER_ROLE.ADMIN) {
                if (param.status) {
                    updateObj.status = param.status;
                    if (param.status === constant_1.constant.TASK_STATUS.APPROVED) {
                        updateObj.approvedBy = this.currentUser._id;
                        updateObj.approvedDate = new Date();
                        let flagNotifyAssignPlusApprove = false;
                        if (!task.assignSelf && param.assignSelf === true) {
                            yield this.addCandidate({ taskId: task._id, userId: task.createdBy, assignSelf: true });
                            flagNotifyAssignPlusApprove = true;
                        }
                        yield this.sendTaskApproveEmail(this.currentUser, taskOwner, task, flagNotifyAssignPlusApprove);
                    }
                }
            }
            else {
                const hasReward = task.reward.usd > 0 || task.rewardUpfront.usd > 0;
                const willHaveReward = (rewardUpfront && rewardUpfront.usd > 0) ||
                    (reward && reward.usd > 0);
                if (!hasReward && willHaveReward) {
                    updateObj.status = constant_1.constant.TASK_STATUS.PENDING;
                    sendTaskPendingRequiredApprovalEmail = true;
                }
            }
            if (this.currentUser._id.toString() === task.createdBy.toString()) {
                if (task.status !== constant_1.constant.TASK_STATUS.APPROVED && task.status !== constant_1.constant.TASK_STATUS.ASSIGNED &&
                    param.status === constant_1.constant.TASK_STATUS.SUBMITTED) {
                    throw 'Invalid Action';
                }
                if (task.status !== constant_1.constant.TASK_STATUS.PENDING && task.status !== constant_1.constant.TASK_STATUS.CREATED &&
                    (param.status === constant_1.constant.TASK_STATUS.SUBMITTED ||
                        param.status === constant_1.constant.TASK_STATUS.APPROVED)) {
                    updateObj.status = param.status;
                    if (param.status === constant_1.constant.TASK_STATUS.SUBMITTED) {
                        yield this.sendTaskSuccessEmail(taskOwner, task);
                    }
                }
            }
            if (param.status === constant_1.constant.TASK_STATUS.SUBMITTED) {
                updateObj.status = constant_1.constant.TASK_STATUS.SUBMITTED;
            }
            yield db_task.update({ _id: taskId }, updateObj);
            let updatedTask = yield db_task.findById(taskId);
            if (sendTaskPendingRequiredApprovalEmail) {
                this.sendTaskPendingEmail(this.currentUser, updatedTask);
            }
            if (sendTaskMarkedAsCompleteEmail) {
                this.sendTaskMarkedAsCompleteEmail(taskOwner, this.currentUser, updatedTask);
            }
            return updatedTask;
        });
    }
    remove(param) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    approve(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = param;
            const role = this.currentUser.role;
            if (!_.includes([constant_1.constant.USER_ROLE.ADMIN, constant_1.constant.USER_ROLE.COUNCIL], role)) {
                throw 'Access Denied';
            }
            const db_task = this.getDBModel('Task');
            const rs = yield db_task.update({ _id: id }, {
                $set: {
                    status: constant_1.constant.TASK_STATUS.APPROVED
                }
            });
            console.log('approve task =>', rs);
            return rs;
        });
    }
    updateCandidate(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { taskCandidateId, user, team, attachment, attachmentFilename, bid } = param;
            const candidateSelector = {
                _id: param.taskCandidateId
            };
            const updateObj = {};
            if (user) {
                updateObj.user = user;
            }
            if (team) {
                updateObj.team = team;
            }
            if (attachment) {
                updateObj.attachment = attachment;
            }
            if (attachmentFilename) {
                updateObj.attachmentFilename = attachmentFilename;
            }
            if (bid || bid === 0) {
                updateObj.bid = bid;
            }
            if (user || team) {
                updateObj.type = user
                    ? constant_1.constant.TASK_CANDIDATE_TYPE.USER
                    : constant_1.constant.TASK_CANDIDATE_TYPE.TEAM;
            }
            const db_tc = this.getDBModel('Task_Candidate');
            if (!(yield db_tc.findOne(candidateSelector))) {
                throw 'Candidate not found';
            }
            yield db_tc.update(candidateSelector, updateObj);
            const taskCandidate = yield db_tc.getDBInstance().findOne(candidateSelector)
                .populate('user', sanitize)
                .populate('team', sanitize);
            if (taskCandidate.team) {
                const db_team = this.getDBModel('Team');
                yield db_team.db.populate(taskCandidate.team, {
                    path: 'owner',
                    select: sanitize
                });
                yield db_team.db.populate(taskCandidate.team, {
                    path: 'members',
                    select: sanitize
                });
            }
            return taskCandidate;
        });
    }
    addCandidate(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { teamId, userId, taskId, applyMsg, assignSelf, attachment, attachmentFilename, bid } = param;
            const doc = {
                task: taskId,
                applyMsg,
                attachment,
                attachmentFilename,
                bid
            };
            const db_user = this.getDBModel('User');
            if (teamId) {
                doc.team = teamId;
                const db_team = this.getDBModel('Team');
                const team = yield db_team.findOne({ _id: teamId });
                if (!team) {
                    throw 'invalid team id';
                }
                doc.type = constant_1.constant.TASK_CANDIDATE_TYPE.TEAM;
            }
            else if (userId) {
                doc.user = userId;
                const user = yield db_user.findOne({ _id: userId });
                if (!user) {
                    throw 'invalid user id';
                }
                doc.type = constant_1.constant.TASK_CANDIDATE_TYPE.USER;
            }
            else {
                throw 'no user id and team id';
            }
            const db_tc = this.getDBModel('Task_Candidate');
            if (yield db_tc.findOne(doc)) {
                throw 'candidate already exists';
            }
            doc.status = constant_1.constant.TASK_CANDIDATE_STATUS.PENDING;
            if (assignSelf) {
                doc.status = constant_1.constant.TASK_CANDIDATE_STATUS.APPROVED;
            }
            const db_task = this.getDBModel('Task');
            const task = yield db_task.findOne({ _id: taskId });
            if (!task) {
                throw 'invalid task id';
            }
            console.log('add task candidate =>', doc);
            const taskCandidate = yield db_tc.save(doc);
            if (task.candidates && task.candidates.length) {
                task.candidates.push(taskCandidate._id);
            }
            else {
                task.candidates = [taskCandidate._id];
            }
            yield task.save();
            yield db_tc.getDBInstance().populate(taskCandidate, {
                path: 'user',
                select: sanitize
            });
            yield db_tc.getDBInstance().populate(taskCandidate, {
                path: 'team',
                select: sanitize
            });
            if (taskCandidate.team) {
                const db_ut = this.getDBModel('User_Team');
                yield db_user.getDBInstance().populate(taskCandidate.team, {
                    path: 'owner',
                    select: sanitize
                });
                yield db_ut.getDBInstance().populate(taskCandidate.team, {
                    path: 'members',
                    select: sanitize
                });
            }
            if (!assignSelf) {
                const taskOwner = yield db_user.findById(task.createdBy);
                yield this.sendAddCandidateEmail(this.currentUser, taskOwner, task);
            }
            return taskCandidate;
        });
    }
    register(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, taskId } = param;
            const doc = {
                task: taskId,
                category: constant_1.constant.TASK_CANDIDATE_CATEGORY.RSVP,
                status: constant_1.constant.TASK_CANDIDATE_STATUS.APPROVED
            };
            const db_user = this.getDBModel('User');
            if (userId) {
                doc.user = userId;
                const user = yield db_user.findOne({ _id: userId });
                if (!user) {
                    throw 'invalid user id';
                }
                doc.type = constant_1.constant.TASK_CANDIDATE_TYPE.USER;
            }
            else {
                throw 'no user id';
            }
            const db_tc = this.getDBModel('Task_Candidate');
            if (yield db_tc.findOne(doc)) {
                throw 'candidate already exists';
            }
            const db_task = this.getDBModel('Task');
            const task = yield db_task.findOne({ _id: taskId });
            if (!task) {
                throw 'invalid task id';
            }
            console.log('register task candidate =>', doc);
            const taskCandidate = yield db_tc.save(doc);
            if (task.candidates && task.candidates.length) {
                task.candidates.push(taskCandidate._id);
            }
            else {
                task.candidates = [taskCandidate._id];
            }
            yield task.save();
            yield db_tc.db.populate(taskCandidate, {
                path: 'user',
                select: sanitize
            });
            yield db_tc.db.populate(taskCandidate, {
                path: 'team',
                select: sanitize
            });
            const taskOwner = yield db_user.findById(task.createdBy);
            yield this.sendAddCandidateEmail(this.currentUser, taskOwner, task);
            return taskCandidate;
        });
    }
    removeCandidate(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { taskId, taskCandidateId } = param;
            const db_task = this.getDBModel('Task');
            const db_tc = this.getDBModel('Task_Candidate');
            let task = yield db_task.getDBInstance().findOne({ _id: taskId })
                .populate('createdBy', sanitize);
            let doc = yield db_tc.findOne({ _id: taskCandidateId });
            if (this.currentUser.role !== constant_1.constant.USER_ROLE.ADMIN &&
                this.currentUser.role !== constant_1.constant.USER_ROLE.COUNCIL &&
                (taskCandidateId && this.currentUser._id.toString() !== (_.get(doc, 'user._id', '')).toString()) &&
                (task.createdBy && task.createdBy._id.toString() !== this.currentUser._id.toString())) {
                throw 'Access Denied';
            }
            doc = {
                _id: taskCandidateId
            };
            yield db_tc.remove(doc);
            task = yield db_task.findOne({ _id: taskId });
            if (!task) {
                throw 'invalid task id';
            }
            const result = yield db_task.db.update({
                _id: task._id
            }, {
                $pull: {
                    candidates: new ObjectId(taskCandidateId)
                }
            });
            console.log('remove task candidate =>', doc);
            return result;
        });
    }
    deregister(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { taskId, taskCandidateId } = param;
            const db_task = this.getDBModel('Task');
            const db_tc = this.getDBModel('Task_Candidate');
            let task = yield db_task.getDBInstance().findOne({ _id: taskId })
                .populate('createdBy', sanitize);
            let doc = yield db_tc.findOne({ _id: taskCandidateId });
            if (this.currentUser.role !== constant_1.constant.USER_ROLE.ADMIN &&
                this.currentUser.role !== constant_1.constant.USER_ROLE.COUNCIL &&
                (taskCandidateId && this.currentUser._id.toString() !== doc.user._id.toString()) &&
                (task.createdBy && task.createdBy._id.toString() !== this.currentUser._id.toString())) {
                throw 'Access Denied';
            }
            doc = {
                _id: taskCandidateId
            };
            yield db_tc.remove(doc);
            task = yield db_task.findOne({ _id: taskId });
            if (!task) {
                throw 'invalid task id';
            }
            const result = yield db_task.db.update({
                _id: task._id
            }, {
                $pull: {
                    candidates: new ObjectId(taskCandidateId)
                }
            });
            console.log('remove task candidate =>', doc);
            return result;
        });
    }
    acceptCandidate(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_task = this.getDBModel('Task');
            const db_tc = this.getDBModel('Task_Candidate');
            let doc = yield db_tc.findById(param.taskCandidateId);
            let task = yield db_task.getDBInstance().findOne({ _id: doc.task })
                .populate('createdBy', sanitize);
            if (this.currentUser.role !== constant_1.constant.USER_ROLE.ADMIN &&
                (task.createdBy && task.createdBy._id.toString() !== this.currentUser._id.toString())) {
                throw 'Access Denied';
            }
            yield db_tc.update({
                _id: param.taskCandidateId
            }, {
                status: constant_1.constant.TASK_CANDIDATE_STATUS.APPROVED
            });
            doc = yield db_tc.getDBInstance().findById(param.taskCandidateId)
                .populate('user');
            task = yield db_task.getDBInstance().findOne({ _id: doc.task })
                .populate({
                path: 'candidates',
                populate: {
                    path: 'user'
                }
            });
            let acceptedCnt = 0;
            let users = [];
            let usersWonBidding = [];
            let usernameWonString = '';
            for (let candidate of task.candidates) {
                if (candidate.status === constant_1.constant.TASK_CANDIDATE_STATUS.APPROVED) {
                    acceptedCnt = +1;
                    usersWonBidding.push(candidate.user);
                    usernameWonString += `${candidate.user.profile.firstName} ${candidate.user.profile.lastName}`;
                    if (task.candidates.length !== acceptedCnt) {
                        usernameWonString += ', ';
                    }
                }
                if (candidate.status !== constant_1.constant.TASK_CANDIDATE_STATUS.APPROVED) {
                    users.push(candidate.user);
                }
            }
            if (task.bidding || acceptedCnt >= task.candidateSltLimit) {
                yield db_task.update({
                    _id: task._id
                }, {
                    status: constant_1.constant.TASK_STATUS.APPROVED
                });
                this.sendWonBiddingEmail(usersWonBidding, task);
                this.sendLostBiddingEmail(users, task, doc, usernameWonString);
            }
            return yield db_task.findById(task._id);
        });
    }
    rejectCandidate(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { taskCandidateId } = param;
            const db_task = this.getDBModel('Task');
            const db_tc = this.getDBModel('Task_Candidate');
            let doc = yield db_tc.findById(taskCandidateId);
            let task = yield db_task.getDBInstance().findOne({ _id: doc.task })
                .populate('createdBy', sanitize);
            if (this.currentUser.role !== constant_1.constant.USER_ROLE.ADMIN &&
                (task.createdBy && task.createdBy._id.toString() !== this.currentUser._id.toString())) {
                throw 'Access Denied';
            }
            yield db_tc.update({
                _id: taskCandidateId
            }, {
                status: constant_1.constant.TASK_CANDIDATE_STATUS.REJECTED
            });
            return db_tc.getDBInstance().findOne({ _id: taskCandidateId })
                .populate('team')
                .populate('user', sanitize);
        });
    }
    withdrawCandidate(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { taskCandidateId } = param;
            const db_task = this.getDBModel('Task');
            const db_tc = this.getDBModel('Task_Candidate');
            let doc = yield db_tc.findById(taskCandidateId);
            yield db_tc.db.populate(doc, ['team']);
            yield db_tc.remove({
                _id: taskCandidateId
            });
            const task = yield db_task.getDBInstance().findOne({ _id: doc.task });
            const result = yield db_task.db.update({
                _id: task._id
            }, {
                $pull: {
                    candidates: new ObjectId(taskCandidateId)
                }
            });
            return result;
        });
    }
    validate_name(name) {
        if (!utility_1.validate.valid_string(name, 4)) {
            throw 'invalid task name';
        }
    }
    validate_description(description) {
        if (!utility_1.validate.valid_string(description, 1)) {
            throw 'invalid task description';
        }
    }
    validate_type(type) {
        if (!type) {
            throw 'task type is empty';
        }
        if (!_.includes(constant_1.constant.TASK_TYPE, type)) {
            throw 'task type is not valid';
        }
    }
    validate_reward_ela(ela) {
    }
    validate_reward_votePower(votePower) {
    }
    getCandidatesForUser(userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_task_candidate = this.getDBModel('Task_Candidate');
            let options = {
                user: userId
            };
            if (!_.isEmpty(status)) {
                options.status = status;
            }
            return db_task_candidate.list(options);
        });
    }
    getCandidatesForTeam(teamId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_task_candidate = this.getDBModel('Task_Candidate');
            let options = {
                team: teamId
            };
            if (!_.isEmpty(status)) {
                options.status = status;
            }
            return db_task_candidate.list(options);
        });
    }
    sendCreateEmail(curUser, task) {
        return __awaiter(this, void 0, void 0, function* () {
            let subject = 'New Task Created: ' + task.name;
            let body = `${this.currentUser.profile.firstName} ${this.currentUser.profile.lastName} has created the task ${task.name}`;
            if (task.status === constant_1.constant.TASK_STATUS.PENDING) {
                subject = 'ACTION REQUIRED: ' + subject;
                body += ` and it requires approval`;
            }
            body += `<br/>
            <br/>
            <a href="${process.env.SERVER_URL}/task-detail/${task._id}">Click here to view the ${task.type.toLowerCase()}</a>
            `;
            const adminUsers = yield this.getAdminUsers();
            for (let admin of adminUsers) {
                yield utility_1.mail.send({
                    to: admin.email,
                    toName: `${admin.profile.firstName} ${admin.profile.lastName}`,
                    subject: subject,
                    body: body
                });
            }
        });
    }
    sendTaskPendingEmail(curUser, task) {
        return __awaiter(this, void 0, void 0, function* () {
            let subject = 'Task ELA Reward Changed: ' + task.name;
            let body = `${this.currentUser.profile.firstName} ${this.currentUser.profile.lastName} has changed the ELA reward for task ${task.name}`;
            if (task.status === constant_1.constant.TASK_STATUS.PENDING) {
                subject = 'ACTION REQUIRED: ' + subject;
                body += ` and it requires approval
                    <br/>
                    <br/>
                    <a href="${process.env.SERVER_URL}/task-detail/${task._id}">Click here to view the ${task.type.toLowerCase()}</a>
                    `;
            }
            const adminUsers = yield this.getAdminUsers();
            for (let admin of adminUsers) {
                yield utility_1.mail.send({
                    to: admin.email,
                    toName: `${admin.profile.firstName} ${admin.profile.lastName}`,
                    subject: subject,
                    body: body
                });
            }
        });
    }
    sendTaskMarkedAsCompleteEmail(taskOwner, curUser, task) {
        return __awaiter(this, void 0, void 0, function* () {
            if (taskOwner._id.toString() === curUser._id.toString()) {
                return;
            }
            let subject = 'Task ' + task.name + ' Marked as Complete';
            let body = `${this.currentUser.profile.firstName} ${this.currentUser.profile.lastName} has marked the task ${task.name} as complete.
            <br/>
            <br/>
            Please verify the task was completed properly and accept it: <a href="${process.env.SERVER_URL}/task-detail/${task._id}">Click here to view the ${task.type.toLowerCase()}</a>
        `;
            yield utility_1.mail.send({
                to: taskOwner.email,
                toName: `${taskOwner.profile.firstName} ${taskOwner.profile.lastName}`,
                subject: subject,
                body: body
            });
        });
    }
    sendWonBiddingEmail(users, task) {
        return __awaiter(this, void 0, void 0, function* () {
            let candidateSubject = `Your application for task ${task.name} has been approved`;
            let candidateBody = `Congratulations, you have won the bidding ${task.name}, you can get started.`;
            for (let user of users) {
                yield utility_1.mail.send({
                    to: user.email,
                    toName: `${user.profile.firstName} ${user.profile.lastName}`,
                    subject: candidateSubject,
                    body: candidateBody
                });
            }
        });
    }
    sendLostBiddingEmail(users, task, taskCandidate, usernameWonString) {
        return __awaiter(this, void 0, void 0, function* () {
            let candidateSubject = `Your application for task ${task.name} has lost the bid`;
            let candidateBody = `${usernameWonString} won the bid at ${taskCandidate.bid} ELA, but don't worry you can bid next time.`;
            for (let user of users) {
                yield utility_1.mail.send({
                    to: user.email,
                    toName: `${user.profile.firstName} ${user.profile.lastName}`,
                    subject: candidateSubject,
                    body: candidateBody
                });
            }
        });
    }
    sendTaskAssignedEmail(taskOwner, doc) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    sendTaskSuccessEmail(taskOwner, doc) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    sendAddCandidateEmail(curUser, taskOwner, task) {
        return __awaiter(this, void 0, void 0, function* () {
            let ownerSubject = `A candidate has applied for your task - ${task.name}`;
            let ownerBody = `
            ${curUser.profile.firstName} ${curUser.profile.lastName} has applied for your task ${task.name}
            <br/>
            Please review their application
            <br/>
            <br/>
            <a href="${process.env.SERVER_URL}/profile/task-detail/${task._id}">Click here to view the ${task.type.toLowerCase()}</a>
            `;
            let ownerTo = taskOwner.email;
            let ownerToName = `${taskOwner.profile.firstName} ${taskOwner.profile.lastName}`;
            yield utility_1.mail.send({
                to: ownerTo,
                toName: ownerToName,
                subject: ownerSubject,
                body: ownerBody
            });
            let candidateSubject = `Your application for task ${task.name} has been received`;
            let candidateBody = `Thank you, the task owner ${taskOwner.profile.firstName} ${taskOwner.profile.lastName} will review your application and be in contact`;
            let candidateTo = curUser.email;
            let candidateToName = `${curUser.profile.firstName} ${curUser.profile.lastName}`;
            yield utility_1.mail.send({
                to: candidateTo,
                toName: candidateToName,
                subject: candidateSubject,
                body: candidateBody
            });
        });
    }
    sendNewCircleTaskNotification(id, task) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_team = this.getDBModel('Team');
            const db_user = this.getDBModel('User');
            const db_user_team = this.getDBModel('User_Team');
            const team = yield db_team.findOne({
                _id: id,
                type: constant_1.constant.TEAM_TYPE.CRCLE
            });
            if (team) {
                const userTeams = yield db_user_team.find({ _id: { $in: team.members } });
                const users = yield db_user.find({ _id: { $in: _.map(userTeams, 'user') } });
                const to = _.map(users, 'email');
                const formatUsername = (user) => {
                    const firstName = user.profile && user.profile.firstName;
                    const lastName = user.profile && user.profile.lastName;
                    if (_.isEmpty(firstName) && _.isEmpty(lastName)) {
                        return user.username;
                    }
                    return [firstName, lastName].join(' ');
                };
                const recVariables = _.zipObject(to, _.map(users, (target) => {
                    return {
                        _id: target._id,
                        username: formatUsername(target)
                    };
                }));
                const subject = `New CRcle Task has been created`;
                const body = `
                <h2>Hello %recipient.username%,</h2>
                <br/>
                A new ${task.type} has been created under the ${team.name} CRcle you're a member of.
                <br/>
                <h3>
                ${task.name}
                </h3>
                <br/>
                <a href="${process.env.SERVER_URL}/profile/task-detail/${task._id}">Click here to view the ${task.type.toLowerCase()}</a>
                `;
                yield utility_1.mail.send({
                    to,
                    subject: subject,
                    body: body,
                    recVariables
                });
            }
        });
    }
    sendTaskApproveEmail(curUser, taskOwner, task, flagNotifyAssignPlusApprove) {
        return __awaiter(this, void 0, void 0, function* () {
            let ownerSubject = `Your task proposal - ${task.name} has been approved`;
            let ownerBody = `
            ${curUser.profile.firstName} ${curUser.profile.lastName} has approved your task proposal ${task.name}
            <br/>${flagNotifyAssignPlusApprove ? 'This task has also been assigned to you by the approver.<br/>' : ''}<br/>
            <a href="${process.env.SERVER_URL}/profile/task-detail/${task._id}">Click here to view the ${task.type.toLowerCase()}</a>
            `;
            let ownerTo = taskOwner.email;
            let ownerToName = `${taskOwner.profile.firstName} ${taskOwner.profile.lastName}`;
            yield utility_1.mail.send({
                to: ownerTo,
                toName: ownerToName,
                subject: ownerSubject,
                body: ownerBody
            });
        });
    }
    isTaskAssignee(task) {
        const taskAssigneeUserId = this.getTaskAssigneeUserId(task);
        let isTaskAssignee = false;
        if (taskAssigneeUserId) {
            isTaskAssignee = taskAssigneeUserId.toString() === this.currentUser._id.toString();
        }
        return isTaskAssignee;
    }
    getTaskAssigneeUserId(task) {
        const taskAssignee = _.filter(task.candidates, { status: constant_1.constant.TASK_CANDIDATE_STATUS.APPROVED });
        if (taskAssignee.length) {
            return _.get(taskAssignee[0], 'user');
        }
    }
    getAdminUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            return db_user.find({
                role: constant_1.constant.USER_ROLE.ADMIN,
                active: true
            });
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=TaskService.js.map