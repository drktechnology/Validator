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
const utility_1 = require("../utility");
const constant_1 = require("../constant");
const sanitize = '-password -salt -email';
const ObjectId = mongoose_1.Types.ObjectId;
const restrictedFields = {
    update: [
        '_id',
        'status',
        'password'
    ]
};
class default_1 extends Base_1.default {
    init() {
        this.model = this.getDBModel('Team');
        this.ut_model = this.getDBModel('User_Team');
    }
    create(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_team = this.getDBModel('Team');
            const db_user_team = this.getDBModel('User_Team');
            this.validate_name(param.name);
            const doc = {
                name: param.name,
                domain: param.domain,
                type: param.type || constant_1.constant.TEAM_TYPE.TEAM,
                metadata: this.param_metadata(param.metadata),
                tags: this.param_tags(param.tags),
                profile: {
                    logo: param.logo,
                    description: param.description
                },
                recruitedSkillsets: param.recruitedSkillsets,
                owner: this.currentUser,
                pictures: param.pictures
            };
            console.log('create team => ', doc);
            const res = yield db_team.save(doc);
            const team = yield db_team.findOne({ _id: res._id });
            const doc_user_team = {
                user: this.currentUser,
                team: res,
                status: constant_1.constant.TEAM_USER_STATUS.NORMAL,
                role: constant_1.constant.TEAM_ROLE.LEADER
            };
            console.log('create user_team => ', doc_user_team);
            const res1 = yield db_user_team.save(doc_user_team);
            team.members = [res1._id];
            yield team.save();
            yield db_team.getDBInstance().populate(team, {
                path: 'owner',
                select: sanitize
            });
            return team;
        });
    }
    update(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { teamId } = param;
            const db_team = this.getDBModel('Team');
            const team = yield db_team.findById(teamId);
            yield db_team.getDBInstance().populate(team, {
                path: 'owner',
                select: sanitize
            });
            if (this.currentUser._id.toString() !== team.owner._id.toString() &&
                this.currentUser.role !== constant_1.constant.USER_ROLE.ADMIN) {
                throw 'Access Denied';
            }
            const doc = {
                name: param.name,
                domain: param.domain,
                type: param.type,
                metadata: this.param_metadata(param.metadata),
                tags: this.param_tags(param.tags),
                profile: {
                    logo: param.logo,
                    description: param.description
                },
                recruitedSkillsets: param.recruitedSkillsets,
                pictures: param.pictures
            };
            this.validate_name(doc.name);
            yield db_team.update({ _id: teamId }, doc);
            return db_team.findById(teamId);
        });
    }
    deleteTeam(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { teamId } = param;
            if (!teamId) {
                throw 'no team id';
            }
            const db_team = this.getDBModel('Team');
            const team = yield db_team.findOne({ _id: teamId });
            if (!team) {
                throw 'invalid team id';
            }
            yield db_team.getDBInstance().populate(team, {
                path: 'owner',
                select: sanitize
            });
            if (this.currentUser._id.toString() !== team.owner._id.toString() &&
                this.currentUser.role !== constant_1.constant.USER_ROLE.ADMIN) {
                throw 'Access Denied';
            }
            const db_ut = this.getDBModel('User_Team');
            for (let member of team.members) {
                yield db_ut.remove({ _id: member });
            }
            const res = yield db_team.remove({ _id: teamId });
            return res;
        });
    }
    addCandidate(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { teamId, userId, applyMsg } = param;
            const doc = {
                teamId,
                team: teamId,
                userId,
                user: userId,
                apply_reason: applyMsg,
                role: constant_1.constant.TEAM_ROLE.MEMBER,
                level: ''
            };
            const db_user = this.getDBModel('User');
            const db_team = this.getDBModel('Team');
            if (!teamId) {
                throw 'no team id';
            }
            doc.team = teamId;
            const team = yield db_team.findOne({ _id: teamId });
            if (!team) {
                throw 'invalid team id';
            }
            if (!userId) {
                throw 'no user id';
            }
            doc.user = userId;
            const user = yield db_user.findOne({ _id: userId });
            if (!user) {
                throw 'invalid user id';
            }
            const db_ut = this.getDBModel('User_Team');
            if (yield db_ut.findOne(doc)) {
                throw 'candidate already exists';
            }
            const userTeams = yield db_ut.find({ user: userId });
            const userCrcles = _.filter(userTeams, { type: constant_1.constant.TEAM_TYPE.CRCLE });
            const MAX_USER_CIRCLES = 2;
            if (_.size(userCrcles) >= MAX_USER_CIRCLES) {
                throw 'maximum number of CRcles reached';
            }
            doc.status = team.type === constant_1.constant.TEAM_TYPE.CRCLE
                ? constant_1.constant.TEAM_USER_STATUS.NORMAL
                : constant_1.constant.TEAM_USER_STATUS.PENDING;
            console.log('add team candidate =>', doc);
            const teamCandidate = yield db_ut.save(doc);
            team.members = team.members || [];
            team.members.push(teamCandidate._id);
            yield team.save();
            if (team.type === constant_1.constant.TEAM_TYPE.CRCLE) {
                user.circles = user.circles || [];
                user.circles.push(team._id);
                yield user.save();
            }
            yield db_ut.db.populate(teamCandidate, ['team', 'user']);
            if (teamCandidate.team) {
                yield db_ut.db.populate(teamCandidate.team, ['owner']);
            }
            const teamOwner = yield db_user.findById(team.owner);
            if (team.type !== constant_1.constant.TEAM_TYPE.CRCLE) {
                yield this.sendAddCandidateEmail(this.currentUser, teamOwner, team);
            }
            return teamCandidate;
        });
    }
    sendAddCandidateEmail(curUser, teamOwner, team) {
        return __awaiter(this, void 0, void 0, function* () {
            let ownerSubject = `A candidate has applied for your team - ${team.name}`;
            let ownerBody = `
            ${curUser.profile.firstName} ${curUser.profile.lastName} has applied for your team ${team.name}
            <br/>
            Please review their application
            <br/>
            <br/>
            <a href="${process.env.SERVER_URL}/profile/team-detail/${team._id}">Click here to view the team</a>
            `;
            let ownerTo = teamOwner.email;
            let ownerToName = `${teamOwner.profile.firstName} ${teamOwner.profile.lastName}`;
            yield utility_1.mail.send({
                to: ownerTo,
                toName: ownerToName,
                subject: ownerSubject,
                body: ownerBody
            });
            let candidateSubject = `Your application for team ${team.name} has been received`;
            let candidateBody = `Thank you, the team owner ${teamOwner.profile.firstName} ${teamOwner.profile.lastName} will review your application and be in contact`;
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
    acceptApply(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { teamCandidateId } = param;
            const db_team = this.getDBModel('Team');
            const db_ut = this.getDBModel('User_Team');
            let doc = yield db_ut.findById(teamCandidateId);
            if (!doc || doc.status !== constant_1.constant.TEAM_USER_STATUS.PENDING) {
                throw 'Invalid status';
            }
            let team = yield db_team.getDBInstance().findOne({ _id: doc.team })
                .populate('owner', sanitize);
            if (this.currentUser.role !== constant_1.constant.USER_ROLE.ADMIN &&
                (team.owner && team.owner._id.toString() !== this.currentUser._id.toString())) {
                throw 'Access Denied';
            }
            yield db_ut.update({
                _id: teamCandidateId
            }, {
                status: constant_1.constant.TEAM_USER_STATUS.NORMAL
            });
            return db_ut.getDBInstance().findOne({ _id: teamCandidateId })
                .populate('team')
                .populate('user', sanitize);
        });
    }
    rejectApply(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { teamCandidateId } = param;
            const db_team = this.getDBModel('Team');
            const db_ut = this.getDBModel('User_Team');
            let doc = yield db_ut.findById(teamCandidateId);
            if (!doc) {
                throw 'Invalid status';
            }
            let team = yield db_team.getDBInstance().findOne({ _id: doc.team })
                .populate('owner', sanitize);
            if (this.currentUser.role !== constant_1.constant.USER_ROLE.ADMIN &&
                (team.owner && team.owner._id.toString() !== this.currentUser._id.toString())) {
                throw 'Access Denied';
            }
            yield db_ut.update({
                _id: teamCandidateId
            }, {
                status: constant_1.constant.TEAM_USER_STATUS.REJECTED
            });
            return db_ut.getDBInstance().findOne({ _id: teamCandidateId })
                .populate('team')
                .populate('user', sanitize);
        });
    }
    withdrawApply(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { teamCandidateId } = param;
            const db_ut = this.getDBModel('User_Team');
            const db_team = this.getDBModel('Team');
            let doc = yield db_ut.findById(teamCandidateId);
            if (!doc || doc.role === constant_1.constant.TEAM_ROLE.OWNER) {
                throw 'Invalid status';
            }
            if (doc.user.toString() !== this.currentUser._id.toString()) {
                throw 'Access Denied';
            }
            yield db_ut.remove({
                _id: teamCandidateId
            });
            const team = yield db_team.getDBInstance().findOne({ _id: doc.team });
            if (team.type === constant_1.constant.TEAM_TYPE.CRCLE) {
                const db_user = this.getDBModel('User');
                yield db_user.db.update({
                    _id: doc.user
                }, {
                    $pull: {
                        circles: new ObjectId(team._id)
                    }
                });
            }
            const result = yield db_team.db.update({
                _id: team._id
            }, {
                $pull: {
                    members: new ObjectId(teamCandidateId)
                }
            });
            return result;
        });
    }
    show(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { teamId, status } = param;
            const db_team = this.getDBModel('Team');
            const db_user = this.getDBModel('User');
            const team = yield db_team.getDBInstance().findOne({ _id: teamId })
                .populate('members', sanitize)
                .populate('owner', sanitize);
            if (team) {
                for (let member of team.members) {
                    yield db_team.getDBInstance().populate(member, {
                        path: 'team',
                        select: sanitize
                    });
                    yield db_user.getDBInstance().populate(member, {
                        path: 'user',
                        select: sanitize
                    });
                    for (let comment of member.comments) {
                        for (let thread of comment) {
                            yield db_user.getDBInstance().populate(thread, {
                                path: 'createdBy',
                                select: sanitize
                            });
                        }
                    }
                }
                for (let comment of team.comments) {
                    for (let thread of comment) {
                        yield db_user.getDBInstance().populate(thread, {
                            path: 'createdBy',
                            select: sanitize
                        });
                    }
                }
            }
            return team;
        });
    }
    list(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_team = this.getDBModel('Team');
            const db_user = this.getDBModel('User');
            const query = {};
            if (param.archived) {
                query.archived = param.archived;
            }
            if (param.name) {
                query.name = param.name;
            }
            if (param.domain) {
                query.domain = { $in: param.domain.split(',') };
            }
            if (param.skillset) {
                query.recruitedSkillsets = { $in: param.skillset.split(',') };
            }
            if (param.owner) {
                query.owner = param.owner;
            }
            if (param.type) {
                query.type = param.type;
            }
            if (param.teamHasUser) {
                const db_user_team = this.getDBModel('User_Team');
                let listObj = {
                    user: param.teamHasUser
                };
                if (param.teamHasUserStatus) {
                    listObj.status = { $in: param.teamHasUserStatus.split(',') };
                }
                const userTeams = yield db_user_team.list(listObj);
                query.$or = [
                    { _id: { $in: _.map(userTeams, 'team') } }
                ];
                query.type = constant_1.constant.TEAM_TYPE.TEAM;
            }
            if (param.type) {
                query.type = param.type;
            }
            const cursor = db_team.getDBInstance().find(query);
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
            const teams = yield cursor;
            for (const team of teams) {
                yield db_team.getDBInstance().populate(team, {
                    path: 'owner',
                    select: sanitize,
                });
                yield db_team.getDBInstance().populate(team, ['members']);
                for (const comment of team.comments) {
                    for (const thread of comment) {
                        yield db_user.getDBInstance().populate(thread, {
                            path: 'createdBy',
                            select: sanitize
                        });
                    }
                }
                if (param.includeTasks) {
                    const db_task = this.getDBModel('Task');
                    const tasks = yield db_task.list({
                        circle: team,
                        status: constant_1.constant.TASK_STATUS.APPROVED
                    });
                    const count = _.size(tasks);
                    const budgetUsd = _.sum(_.map(tasks, (task) => task.reward.usd || 0));
                    const budgetEla = _.sum(_.map(tasks, (task) => task.reward.ela || 0));
                    team.tasks = {
                        count,
                        budget: {
                            usd: budgetUsd,
                            ela: budgetEla
                        }
                    };
                }
            }
            return teams;
        });
    }
    listMember(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { teamId } = param;
            const db_team = this.getDBModel('Team');
            const aggregate = db_team.getAggregate();
            const rs = yield aggregate.match({ _id: mongoose_1.Types.ObjectId(teamId) })
                .unwind('$members')
                .lookup({
                from: 'users',
                localField: 'members.userId',
                foreignField: '_id',
                as: 'members.user'
            })
                .unwind('$members.user')
                .group({
                _id: '$_id',
                list: {
                    $push: '$members'
                }
            })
                .project({ 'list.user.password': 0, 'list._id': 0 });
            return rs[0].list;
        });
    }
    validate_name(name) {
        if (!utility_1.validate.valid_string(name, 4)) {
            throw 'invalid team name';
        }
    }
    param_metadata(meta) {
        const rs = {};
        if (meta) {
            const list = meta.split(',');
            _.each(list, (str) => {
                const tmp = str.split('|');
                if (tmp.length === 2) {
                    rs[tmp[0]] = tmp[1];
                }
            });
        }
        return rs;
    }
    param_tags(tags) {
        let rs = [];
        if (tags) {
            rs = tags.split(',');
        }
        return rs;
    }
}
exports.default = default_1;
//# sourceMappingURL=TeamService.js.map