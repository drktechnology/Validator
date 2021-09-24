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
const Mailgun = require("mailgun-js");
const _ = require("lodash");
exports.default = {
    send(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { to, toName, subject, body, replyTo, recVariables } = options;
            if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_URL) {
                console.log('Err: mailgun service not ready');
                return;
            }
            const mailgun = Mailgun({
                apiKey: process.env.MAILGUN_API_KEY,
                domain: process.env.MAILGUN_URL
            });
            const data = {
                from: process.env.MAILGUN_URL_FROM_TEXT,
                to: _.isArray(to) ? to : `${toName} <${to}>`,
                subject: subject,
                html: body,
                'recipient-variables': _.isArray(to) && recVariables
            };
            if (replyTo && !_.isEmpty(replyTo)) {
                data['h:Reply-To'] = `${replyTo.name} <${replyTo.email}>`;
            }
            if (process.env.NODE_ENV === 'dev') {
                console.log('Debug - Sending Mail:', data);
            }
            return new Promise((resolve, reject) => {
                resolve();
                mailgun.messages().send(data, function (err, body) {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    }
};
//# sourceMappingURL=mail.js.map