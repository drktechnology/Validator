"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const SuggestionSchema_1 = require("./schema/SuggestionSchema");
const mongoose_plugin_autoinc_1 = require("mongoose-plugin-autoinc");
class default_1 extends Base_1.default {
    getSchema() {
        return SuggestionSchema_1.Suggestion;
    }
    getName() {
        return 'suggestion';
    }
    buildSchema() {
        const schema = super.buildSchema();
        const options = {
            model: this.getName(),
            field: 'displayId',
            startAt: 1,
        };
        schema.plugin(mongoose_plugin_autoinc_1.autoIncrement, options);
        schema.index({ descUpdatedAt: -1 });
        schema.index({ likesNum: -1 });
        schema.index({ activeness: -1 });
        schema.index({ viewsNum: -1 });
        return schema;
    }
}
exports.default = default_1;
//# sourceMappingURL=Suggestion.js.map