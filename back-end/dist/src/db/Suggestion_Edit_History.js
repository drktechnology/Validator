"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const SuggestionEditHistorySchema_1 = require("./schema/SuggestionEditHistorySchema");
class default_1 extends Base_1.default {
    getSchema() {
        return SuggestionEditHistorySchema_1.SuggestionEditHistory;
    }
    getName() {
        return 'suggestion_edit_history';
    }
}
exports.default = default_1;
//# sourceMappingURL=Suggestion_Edit_History.js.map