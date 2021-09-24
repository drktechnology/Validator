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
const s3 = require("s3");
const uuid = require("uuid");
const fs = require("fs");
let s3_client = undefined;
class default_1 extends Base_1.default {
    init() {
        this.config = {
            bucket: process.env.S3_BUCKET,
            region: process.env.S3_REGION
        };
        if (!s3_client) {
            this.initS3Client();
        }
    }
    initS3Client() {
        s3_client = s3.createClient({
            maxAsyncS3: 20,
            s3RetryCount: 3,
            s3RetryDelay: 1000,
            multipartUploadThreshold: 20971520,
            multipartUploadSize: 5242880,
            s3Options: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_ACCESS_SECRET,
                region: this.config.region,
            }
        });
    }
    saveFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const file_name = uuid.v4() + '_' + file.name;
            const path = process.cwd() + '/.upload/';
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
            const res = yield file.mv(path + file_name);
            const uploader = s3_client.uploadFile({
                localFile: path + file_name,
                s3Params: {
                    ACL: 'public-read',
                    Bucket: this.config.bucket,
                    Key: file_name
                }
            });
            return new Promise((resolve, reject) => {
                uploader.on('error', (err) => {
                    console.error('unable to upload:', err.stack);
                    reject(err);
                });
                uploader.on('end', () => {
                    fs.unlinkSync(path + file_name);
                    const url = s3.getPublicUrl(this.config.bucket, file_name, this.config.region);
                    resolve(url);
                });
            });
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=UploadService.js.map