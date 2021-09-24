"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const EventSchema_1 = require("./schema/EventSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return EventSchema_1.Event;
    }
    getName() {
        return 'Event';
    }
}
exports.default = default_1;
//# sourceMappingURL=Event.js.map