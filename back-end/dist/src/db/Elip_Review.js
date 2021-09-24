"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const ElipReviewSchema_1 = require("./schema/ElipReviewSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return ElipReviewSchema_1.Elip_Review;
    }
    getName() {
        return 'elip_review';
    }
    rejectFields() {
        return {};
    }
}
exports.default = default_1;
//# sourceMappingURL=Elip_Review.js.map