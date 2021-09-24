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
const geo_1 = require("../utility/geo");
const uuid = require("uuid");
const utility_1 = require("../utility");
const CommunityService_1 = require("./CommunityService");
const selectFields = '-salt -password -elaBudget -elaOwed -votePower -resetToken';
const strictSelectFields = selectFields + ' -email -profile.walletAddress';
const restrictedFields = {
    update: [
        '_id',
        'username',
        'role',
        'profile',
        'salt'
    ]
};
class default_1 extends Base_1.default {
    registerNewUser(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            const username = param.username.toLowerCase();
            const email = param.email.toLowerCase();
            this.validate_username(username);
            this.validate_password(param.password);
            this.validate_email(email);
            if (yield db_user.findOne({ username })) {
                throw 'This username is already taken';
            }
            if (yield db_user.findOne({ email: email })) {
                throw 'This email is already taken';
            }
            const salt = uuid.v4();
            const doc = {
                username,
                password: this.getPassword(param.password, salt),
                email,
                salt,
                profile: {
                    firstName: param.firstName,
                    lastName: param.lastName,
                    country: param.country,
                    timezone: param.timezone,
                    state: param.state,
                    city: param.city,
                    beOrganizer: param.beOrganizer === 'yes',
                    isDeveloper: param.isDeveloper === 'yes',
                    source: param.source
                },
                role: constant_1.constant.USER_ROLE.MEMBER,
                active: true
            };
            if (process.env.NODE_ENV === 'test') {
                if (param._id) {
                    doc._id = param._id.$oid;
                }
            }
            const newUser = yield db_user.save(doc);
            yield this.linkCountryCommunity(newUser);
            this.sendConfirmation(doc);
            return newUser;
        });
    }
    recordLogin(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            yield db_user.update({ _id: param.userId }, { $push: { logins: new Date() } });
        });
    }
    getUserSalt(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const isEmail = utility_1.validate.email(username);
            username = username.toLowerCase();
            const query = { [isEmail ? 'email' : 'username']: username };
            const db_user = this.getDBModel('User');
            const user = yield db_user.db.findOne(query);
            if (!user) {
                throw 'invalid username or email';
            }
            return user.salt;
        });
    }
    show(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = param;
            const db_user = this.getDBModel('User');
            const userRole = _.get(this.currentUser, 'role');
            const isUserAdmin = utility_1.permissions.isAdmin(userRole);
            const isSelf = _.get(this.currentUser, '_id') === userId;
            let fields = (isUserAdmin || isSelf) ? selectFields : strictSelectFields;
            if (param.admin && !isUserAdmin && !isSelf) {
                throw 'Access Denied';
            }
            const user = yield db_user.getDBInstance().findOne({
                _id: userId,
                $or: [
                    { banned: { $exists: false } },
                    { banned: false }
                ]
            })
                .select(fields)
                .populate('circles');
            if (!user) {
                throw `userId: ${userId} not found`;
            }
            if (user.comments) {
                for (let comment of user.comments) {
                    for (let thread of comment) {
                        yield db_user.getDBInstance().populate(thread, {
                            path: 'createdBy',
                            select: fields
                        });
                    }
                }
                for (let subscriber of user.subscribers) {
                    yield db_user.getDBInstance().populate(subscriber, {
                        path: 'user',
                        select: fields
                    });
                }
            }
            return user;
        });
    }
    updateRole(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, role } = param;
            const db_user = this.getDBModel('User');
            const userRole = _.get(this.currentUser, 'role');
            const isUserAdmin = utility_1.permissions.isAdmin(userRole);
            if (!isUserAdmin) {
                throw 'Access Denied';
            }
            if (Object.keys(constant_1.constant.USER_ROLE).indexOf(role) === -1) {
                throw 'invalid role';
            }
            return yield db_user.update({ _id: userId }, { role });
        });
    }
    update(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = param;
            const updateObj = _.omit(param, restrictedFields.update);
            const db_user = this.getDBModel('User');
            let user = yield db_user.findById(userId);
            const isSelf = _.get(this.currentUser, '_id', '').toString() === userId;
            const userRole = _.get(this.currentUser, 'role');
            const isUserAdmin = utility_1.permissions.isAdmin(userRole);
            const canUpdate = isUserAdmin || isSelf;
            let countryChanged = false;
            let fields = (isUserAdmin || isSelf) ? selectFields : strictSelectFields;
            if (!canUpdate) {
                throw 'Access Denied';
            }
            if (!user) {
                throw `userId: ${userId} not found`;
            }
            if (param.profile && param.profile.country && param.profile.country !== user.profile.country) {
                countryChanged = true;
            }
            if (param.profile) {
                updateObj.profile = Object.assign(user.profile, param.profile);
                if (param.profile.skillset) {
                    updateObj.profile.skillset = param.profile.skillset;
                }
            }
            if (param.timezone) {
                updateObj.timezone = param.timezone;
            }
            if (param.email) {
                updateObj.email = param.email;
            }
            if (param.password) {
                const salt = uuid.v4();
                updateObj.password = this.getPassword(param.password, salt);
                updateObj.salt = salt;
            }
            if (param.removeAttachment) {
                updateObj.avatar = undefined;
                updateObj.avatarFileType = '';
                updateObj.avatarFilename = '';
            }
            if (param.removeBanner) {
                updateObj.banner = undefined;
                updateObj.bannerFileType = '';
                updateObj.bannerFilename = '';
            }
            if (param.popupUpdate) {
                updateObj.popupUpdate = param.popupUpdate;
            }
            yield db_user.update({ _id: userId }, updateObj);
            user = db_user.getDBInstance().findOne({ _id: userId }).select(fields)
                .populate('circles');
            if (countryChanged) {
                yield this.linkCountryCommunity(user);
            }
            return user;
        });
    }
    findUser(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            const isEmail = utility_1.validate.email(query.username);
            return yield db_user.getDBInstance().findOne({
                [isEmail ? 'email' : 'username']: query.username.toLowerCase(),
                password: query.password,
                $or: [
                    { banned: { $exists: false } },
                    { banned: false }
                ]
            }).select(selectFields).populate('circles');
        });
    }
    findUsers(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            return yield db_user.getDBInstance().find({
                '_id': {
                    $in: query.userIds
                }
            }).select(strictSelectFields);
        });
    }
    findAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            const finalQuery = {
                active: true,
                archived: { $ne: true }
            };
            if (query.search) {
                finalQuery.$and = _.map(_.trim(query.search).split(' '), (part) => {
                    return {
                        $or: [
                            { 'profile.firstName': { $regex: part, $options: 'i' } },
                            { 'profile.lastName': { $regex: part, $options: 'i' } },
                            { username: { $regex: part, $options: 'i' } }
                        ]
                    };
                });
            }
            if (query.skillset) {
                const skillsets = query.skillset.split(',');
                finalQuery['profile.skillset'] = { $in: skillsets };
            }
            if (query.profession) {
                const professions = query.profession.split(',');
                finalQuery['profile.profession'] = { $in: professions };
            }
            if (query.empower) {
                finalQuery.empower = JSON.parse(query.empower);
            }
            const cursor = db_user.getDBInstance().find(finalQuery);
            const totalCursor = db_user.getDBInstance().find(finalQuery).count();
            if (query.results) {
                const results = parseInt(query.results, 10);
                const page = parseInt(query.page, 10);
                cursor.skip(results * (page - 1)).limit(results);
            }
            cursor.select(strictSelectFields).sort({ username: 1 });
            const users = yield cursor;
            const total = yield totalCursor;
            if (users.length) {
                const db_team = this.getDBModel('Team');
                for (let user of users) {
                    yield db_team.getDBInstance().populate(user, {
                        path: 'circles'
                    });
                }
            }
            return {
                list: users,
                total
            };
        });
    }
    getCouncilMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            const query = { role: constant_1.constant.USER_ROLE.COUNCIL };
            const councilMembers = yield db_user.getDBInstance().find(query)
                .select(constant_1.constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL);
            return {
                list: councilMembers,
            };
        });
    }
    changePassword(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            const { oldPassword, password } = param;
            const username = param.username.toLowerCase();
            const userRole = _.get(this.currentUser, 'role');
            const isUserAdmin = utility_1.permissions.isAdmin(userRole);
            const isSelf = _.get(this.currentUser, 'username') === username;
            this.validate_password(oldPassword);
            this.validate_password(password);
            this.validate_username(username);
            if (!isUserAdmin && !isSelf) {
                throw 'Access Denied';
            }
            let user = yield db_user.findOne({ username }, { reject: false });
            if (!user) {
                throw 'user does not exist';
            }
            if (user.password !== this.getPassword(oldPassword, user.salt)) {
                throw 'old password is incorrect';
            }
            const res = yield db_user.update({ username }, {
                $set: {
                    password: this.getPassword(password, user.salt)
                }
            });
            user = db_user.getDBInstance().findOne({ username })
                .populate('circles');
            return user;
        });
    }
    forgotPassword(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = param;
            console.log(`forgotPassword called on email: ${email}`);
            const db_user = this.getDBModel('User');
            const userEmailMatch = yield db_user.findOne({
                email: email,
                active: true
            });
            if (!userEmailMatch) {
                console.error('no user matched');
                return;
            }
            const resetToken = yield utility_1.utilCrypto.randomHexStr(8);
            yield userEmailMatch.update({
                resetToken
            });
            yield utility_1.mail.send({
                to: userEmailMatch.email,
                toName: `${userEmailMatch.profile.firstName} ${userEmailMatch.profile.lastName}`,
                subject: process.env.PROJECT + ' - Password Reset',
                body: `For your convenience your username is ${userEmailMatch.username}
                <br/>
                <br/>
                Please click this link to reset your password:
                <a href="${process.env.SERVER_URL}/reset-password?token=${resetToken}">${process.env.SERVER_URL}/reset-password?token=${resetToken}</a>`
            });
        });
    }
    resetPassword(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            const { resetToken, password } = param;
            this.validate_password(password);
            const userMatchedByToken = yield db_user.db.findOne({
                resetToken: resetToken,
                active: true
            });
            if (!userMatchedByToken) {
                console.error(`resetToken ${resetToken} did not match user`);
                throw 'token invalid';
            }
            const result = yield db_user.update({ _id: userMatchedByToken._id }, {
                $set: {
                    password: this.getPassword(password, userMatchedByToken.salt)
                },
                $unset: {
                    resetToken: 1
                }
            });
            if (!result.nModified) {
                console.error(`resetToken ${resetToken} password update failed`);
                throw 'password update failed';
            }
            return 1;
        });
    }
    getSumElaBudget(ela) {
        let total = 0;
        _.each(ela, (item) => {
            total += item.amount;
        });
        return total;
    }
    getPassword(password, salt) {
        return utility_1.utilCrypto.sha512(password + salt);
    }
    validate_username(username) {
        if (!utility_1.validate.valid_string(username, 6)) {
            throw 'invalid username';
        }
    }
    validate_password(password) {
        if (!utility_1.validate.valid_string(password, 8)) {
            throw 'invalid password';
        }
    }
    validate_email(email) {
        if (!utility_1.validate.email(email)) {
            throw 'invalid email';
        }
    }
    sendEmail(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fromUserId, toUserId, subject, message } = param;
            if (this.currentUser._id.toString() !== fromUserId) {
                throw 'User mismatch - from user must = sender';
            }
            const db_user = this.getDBModel('User');
            const fromUser = yield db_user.findById(fromUserId);
            const toUser = yield db_user.findById(toUserId);
            const formattedSubject = subject || 'New ' + process.env.PROJECT + ' private message';
            const body = `
            New message from <a href="${process.env.SERVER_URL}/member/${fromUserId}">${fromUser.username}</a>
            <br/>
            <br/>
            ${message}
        `;
            if (!fromUser) {
                throw 'From user not found';
            }
            if (!toUser) {
                throw 'From user not found';
            }
            yield utility_1.mail.send({
                to: toUser.email,
                toName: `${toUser.profile.firstName} ${toUser.profile.lastName}`,
                subject: formattedSubject,
                body,
                replyTo: {
                    name: `${fromUser.profile.firstName} ${fromUser.profile.lastName}`,
                    email: fromUser.email
                }
            });
            return true;
        });
    }
    sendRegistrationCode(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, code } = param;
            if (process.env.MAILGUN_DEV_CODE_BYPASS === 'true') {
                console.log('Your code: ', code);
                return true;
            }
            yield utility_1.mail.send({
                to: email,
                toName: email,
                subject: 'Your ' + process.env.PROJECT + ' registration code',
                body: `Your code: ${code}`
            });
            yield utility_1.mail.send({
                to: process.env.MAILGUN_BACKUP,
                toName: process.env.MAILGUN_BACKUP,
                subject: 'New Code Registration',
                body: `Code: ${code} -> ${email}`
            });
            return true;
        });
    }
    sendConfirmation(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = param;
            yield utility_1.mail.send({
                to: email,
                toName: email,
                subject: 'Welcome to ' + process.env.PROJECT + ' Community',
                body: `
                Your registration is complete, your login is automatically linked to: <br/>
                <br/>
                <a href="` + process.env.FORUM_URL + `">Click here to join us on the forums</a>
            `
            });
            return true;
        });
    }
    linkCountryCommunity(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_community = this.getDBModel('Community');
            const communityService = this.getService(CommunityService_1.default);
            if (!user.profile || _.isEmpty(user.profile.country)) {
                return;
            }
            let countryCommunity = yield db_community.findOne({
                type: constant_1.constant.COMMUNITY_TYPE.COUNTRY,
                geolocation: user.profile.country
            });
            if (!countryCommunity) {
                countryCommunity = yield communityService.create({
                    name: geo_1.geo.geolocationMap[user.profile.country],
                    type: constant_1.constant.COMMUNITY_TYPE.COUNTRY,
                    geolocation: user.profile.country,
                    parentCommunityId: undefined
                });
            }
            yield communityService.addMember({
                userId: user._id,
                communityId: countryCommunity._id
            });
        });
    }
    checkEmail(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_user = this.getDBModel('User');
            const email = param.email.toLowerCase();
            this.validate_email(email);
            if (yield db_user.findOne({ email: email })) {
                throw 'This email is already taken';
            }
            return true;
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=UserService.js.map