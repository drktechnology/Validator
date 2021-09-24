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
const translate_1 = require("@google-cloud/translate");
class default_1 extends Base_1.default {
    translate(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { text, target } = param;
            let translation;
            const projectId = process.env.TRANSLATION_PROJECT_ID;
            const keyFilename = process.env.PWD + process.env.TRANSLATION_KEY_FILE;
            const translate = new translate_1.Translate({
                projectId,
                keyFilename
            });
            try {
                const results = yield translate.translate(text, target || 'en');
                translation = results[0];
            }
            catch (err) {
                console.error('ERROR:', err);
            }
            return { translation };
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=GoogleService.js.map