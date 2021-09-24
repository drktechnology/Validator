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
const utility_1 = require("../utility");
class default_1 extends Base_1.default {
    create(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_community = this.getDBModel('Community');
            this.validate_name(param.name);
            const { name, parentCommunityId, geolocation, type, leaderIds } = param;
            const doc = {
                name,
                parentCommunityId,
                geolocation,
                type,
                leaderIds: this.param_leaderIds(leaderIds),
                createdBy: this.currentUser ? this.currentUser._id : undefined
            };
            return yield db_community.save(doc);
        });
    }
    update(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_community = this.getDBModel('Community');
            this.validate_name(param.name);
            const { _id, name, parentCommunityId, geolocation, type, leaderIds } = param;
            const doc = {
                $set: {
                    name,
                    parentCommunityId,
                    geolocation,
                    type,
                    leaderIds: this.param_leaderIds(leaderIds)
                }
            };
            return yield db_community.update({ _id: _id }, doc);
        });
    }
    index(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_community = this.getDBModel('Community');
            const db_user_community = this.getDBModel('User_Community');
            const query = param.query || {};
            if (param.communityHasUser) {
                if (param.communityHasUser === 'undefined') {
                    param.communityHasUser = undefined;
                }
                const userCommunities = yield db_user_community.find({
                    userId: param.communityHasUser
                });
                query._id = { $in: _.map(userCommunities, 'communityId') };
            }
            return yield db_community.getDBInstance().find(query).sort({ name: 1 });
        });
    }
    get(communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_community = this.getDBModel('Community');
            return yield db_community.findById(communityId);
        });
    }
    listMember(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { communityId } = param;
            const db_user_community = this.getDBModel('User_Community');
            return yield db_user_community.find({ communityId });
        });
    }
    listCommunity(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = param;
            const db_user_community = this.getDBModel('User_Community');
            return yield db_user_community.find({ userId });
        });
    }
    findCommunities(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_community = this.getDBModel('Community');
            return yield db_community.find({
                '_id': {
                    $in: query.communityIds
                }
            });
        });
    }
    addMember(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, communityId } = param;
            const db_user_community = this.getDBModel('User_Community');
            const tmp = yield db_user_community.findOne({
                userId: userId,
                communityId: communityId
            });
            if (tmp) {
                return;
            }
            yield db_user_community.save({
                userId,
                communityId
            });
            return true;
        });
    }
    removeMember(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, communityId } = param;
            const db_user_community = this.getDBModel('User_Community');
            const tmp = yield db_user_community.findOne({
                userId,
                communityId
            });
            if (!tmp) {
                throw 'user is not exist';
            }
            yield db_user_community.findOneAndDelete({
                userId: userId,
                communityId: communityId
            });
            return true;
        });
    }
    removeCommunity(communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_community = this.getDBModel('Community');
            yield db_community.findByIdAndDelete(communityId);
            return true;
        });
    }
    validate_name(name) {
        if (!utility_1.validate.valid_string(name, 2)) {
            throw 'invalid community name';
        }
    }
    param_leaderIds(leaderIds) {
        let rs = [];
        if (leaderIds) {
            rs = leaderIds.split(',');
        }
        return rs;
    }
}
exports.default = default_1;
//# sourceMappingURL=CommunityService.js.map