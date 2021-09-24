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
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const timeout = require("connect-timeout");
const session = require("express-session");
const ConnectMongo = require("connect-mongo");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const compression = require("compression");
const fs = require("fs");
const accessControl_1 = require("./utility/accessControl");
const db_1 = require("./db");
const utility_1 = require("./utility");
const router_1 = require("./router");
require("./config");
const contract = require("./contract");
const rateLimit = require("express-rate-limit");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const app = express();
    const DB = yield db_1.default.create();
    yield contract.initContract(DB);
    contract.startListening();
    const permissions = yield DB.getModel('Permission').find();
    const prefix = '/api';
    app.set('trust proxy', true);
    app.use(cors());
    app.use(compression());
    app.options('*', cors());
    const TIMEOUT = '600s';
    app.use(timeout(TIMEOUT));
    morgan.format('ebp', '[Backend] :method :url :status :res[content-length] - :response-time ms');
    app.use(morgan('ebp'));
    app.use(morgan('common', { stream: fs.createWriteStream('./access.log', { flags: 'a' }) }));
    app.use(helmet());
    const bodyParserOptions = {
        strict: false,
        limit: '2mb'
    };
    app.use(bodyParser.json(bodyParserOptions));
    app.use(bodyParser.urlencoded({ extended: false }));
    const SessionStore = ConnectMongo(session);
    app.use(session({
        name: 'ebp-token',
        secret: process.env.APP_SECRET || 'session_secret',
        store: new SessionStore({
            mongooseConnection: DB.connection
        }),
        saveUninitialized: false,
        resave: false,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 * 30
        }
    }));
    app.use(router_1.middleware);
    app.use(fileUpload());
    accessControl_1.default(prefix, app, permissions);
    const limiter = rateLimit({
        windowMs: 24 * 60 * 60 * 1000,
        max: 10,
        message: 'Its enough for today!'
    });
    app.use("/api/test/claim_faucet", limiter);
    app.use(prefix, router_1.default);
    if (utility_1.logger.rollbar()) {
        app.use(utility_1.logger.rollbar().errorHandler());
    }
    const port = process.env.SERVER_PORT;
    app.listen(port, () => {
        console.log(`start server at port ${port}`);
    });
}))();
//# sourceMappingURL=app.js.map