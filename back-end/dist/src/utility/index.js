"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = exports.logger = exports.mail = exports.permissions = exports.validate = exports.user = exports.sso = exports.utilCrypto = void 0;
const crypto_1 = require("./crypto");
exports.utilCrypto = crypto_1.default;
const mail_1 = require("./mail");
exports.mail = mail_1.default;
const validate_1 = require("./validate");
exports.validate = validate_1.default;
const sso_1 = require("./sso");
exports.sso = sso_1.default;
const user_1 = require("./user");
exports.user = user_1.default;
const permissions = require("./permissions");
exports.permissions = permissions;
const logger = require("./logger");
exports.logger = logger;
exports.getEnv = () => process.env.NODE_ENV;
//# sourceMappingURL=index.js.map