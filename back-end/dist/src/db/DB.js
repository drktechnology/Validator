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
const mongoose = require("mongoose");
const Validator_1 = require("./Validator");
const Event_1 = require("./Event");
const Test_1 = require("./Test");
const User_1 = require("./User");
const Team_1 = require("./Team");
const User_Team_1 = require("./User_Team");
const Task_1 = require("./Task");
const Community_1 = require("./Community");
const User_Community_1 = require("./User_Community");
const Task_Candidate_1 = require("./Task_Candidate");
const Submission_1 = require("./Submission");
const Suggestion_1 = require("./Suggestion");
const CVote_1 = require("./CVote");
const CVote_Tracking_1 = require("./CVote_Tracking");
const CVote_Summary_1 = require("./CVote_Summary");
const Permission_1 = require("./Permission");
const Permission_Role_1 = require("./Permission_Role");
const Release_1 = require("./Release");
const Elip_1 = require("./Elip");
const Elip_Review_1 = require("./Elip_Review");
const Suggestion_Edit_History_1 = require("./Suggestion_Edit_History");
const Log_1 = require("./Log");
const Faucet_1 = require("./Faucet");
const utility_1 = require("../utility");
const uuid = require("uuid");
class default_1 {
    constructor() {
        this.db = {};
    }
    isConnected() {
        return this.connection && this.connection.readyState === 1;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = process.env.DB_URL;
            const db = yield mongoose.createConnection(url);
            this.connection = db;
            this.connection.on('error', this.handleDBError);
            this.connection.on('disconnected', this.handleUnexpectedDisconnect);
            this.connection.on('reconnected', function () {
                console.log('MongoDB reconnected!');
            });
            this.initDB(db);
            yield this.initTest();
            yield this.prepareRecord();
            return db;
        });
    }
    handleDBError() {
        return (error) => {
            console.log('Error is happenning', error);
        };
    }
    handleUnexpectedDisconnect() {
        console.log('handleUnexpectedDisconnect');
        return (error) => {
            console.error('mongodb is disconnect', error);
            setTimeout(() => {
                this.start();
            }, 5000);
        };
    }
    disconnect() {
        mongoose.connection.close();
    }
    initTest() {
        return __awaiter(this, void 0, void 0, function* () {
            const u = yield this.db.Test.find({});
            if (u.length < 1) {
                const rs = yield this.db.Test.save({
                    name: 'test',
                    age: 100,
                    time: Date.now()
                });
            }
        });
    }
    initDB(db) {
        this.db.Validator = new Validator_1.default(db);
        this.db.Event = new Event_1.default(db);
        this.db.Faucet = new Faucet_1.default(db);
        this.db.Test = new Test_1.default(db);
        this.db.User = new User_1.default(db);
        this.db.Team = new Team_1.default(db);
        this.db.User_Team = new User_Team_1.default(db);
        this.db.Task_Candidate = new Task_Candidate_1.default(db);
        this.db.Task = new Task_1.default(db);
        this.db.Community = new Community_1.default(db);
        this.db.User_Community = new User_Community_1.default(db);
        this.db.Log = new Log_1.default(db);
        this.db.Submission = new Submission_1.default(db);
        this.db.Suggestion = new Suggestion_1.default(db);
        this.db.CVote = new CVote_1.default(db);
        this.db.CVote_Tracking = new CVote_Tracking_1.default(db);
        this.db.CVote_Summary = new CVote_Summary_1.default(db);
        this.db.Permission = new Permission_1.default(db);
        this.db.Permission_Role = new Permission_Role_1.default(db);
        this.db.Release = new Release_1.default(db);
        this.db.Elip = new Elip_1.default(db);
        this.db.Elip_Review = new Elip_Review_1.default(db);
        this.db.Suggestion_Edit_History = new Suggestion_Edit_History_1.default(db);
    }
    getModel(name) {
        const rs = this.db[name];
        if (!rs) {
            throw new Error('invalid model name : ' + name);
        }
        return rs;
    }
    prepareRecord() {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = uuid.v4();
            const password = utility_1.utilCrypto.sha512(process.env.ADMIN_PASSWORD + salt);
            const doc = {
                username: process.env.ADMIN_USERNAME,
                password,
                salt,
                email: process.env.ADMIN_EMAIL,
                role: 'ADMIN',
                active: true,
                profile: {
                    firstName: 'Admin',
                    lastName: process.env.PROJECT,
                    region: {
                        country: process.env.ADMIN_COUNTRY,
                        city: ''
                    }
                }
            };
            try {
                const rs = yield this.db.User.save(doc);
                console.log('create admin user =>', rs);
            }
            catch (err) {
                if (err.code === 11000) {
                    console.log('admin user already exists');
                }
                else {
                    console.error(err);
                }
            }
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=DB.js.map