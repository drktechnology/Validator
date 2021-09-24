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
const _ = require("lodash");
const constant_1 = require("../constant");
class Base {
    constructor(db, session) {
        this.db = db;
        this.session = session;
        this.currentUser = session.user;
        this.init();
    }
    init() { }
    getDBModel(name) {
        return this.db.getModel(name);
    }
    getService(service) {
        return new service(this.db, this.session);
    }
    markLastSeenComment(commentable, createdBy, db_commentable) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.currentUser) {
                return;
            }
            if (commentable.comments && commentable.comments.length) {
                const subscriberInfo = _.find(commentable.subscribers, subscriber => {
                    return (subscriber.user &&
                        subscriber.user._id.toString() === this.currentUser._id.toString());
                });
                if (subscriberInfo) {
                    subscriberInfo.lastSeen = new Date();
                }
                else if (createdBy &&
                    createdBy._id.toString() === this.currentUser._id.toString()) {
                    commentable.lastCommentSeenByOwner = new Date();
                }
                yield db_commentable.update({ _id: commentable._id }, {
                    subscribers: commentable.subscribers,
                    lastCommentSeenByOwner: commentable.lastCommentSeenByOwner
                });
            }
        });
    }
    isLoggedIn() {
        let isLoggedIn = false;
        if (this.currentUser && this.currentUser._id) {
            isLoggedIn = true;
        }
        return isLoggedIn;
    }
    isAdmin() {
        return this.currentUser.role === constant_1.constant.USER_ROLE.ADMIN;
    }
}
exports.default = Base;
//# sourceMappingURL=Base.js.map