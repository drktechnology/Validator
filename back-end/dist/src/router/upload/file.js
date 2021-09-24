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
const Base_1 = require("../Base");
const UploadService_1 = require("../../service/UploadService");
class UploadFile extends Base_1.default {
    action() {
        return __awaiter(this, void 0, void 0, function* () {
            const uploadService = this.buildService(UploadService_1.default);
            if (!this.req['files'] || !this.req['files'].file) {
                throw 'invalid upload file';
            }
            const url = yield uploadService.saveFile(this.req['files'].file);
            return this.result(1, {
                url
            });
        });
    }
}
exports.default = UploadFile;
//# sourceMappingURL=file.js.map