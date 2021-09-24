"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.rollbar = void 0;
const Rollbar = require("rollbar");
exports.rollbar = () => {
    let rollbar = undefined;
    if (process.env.NODE_ENV !== 'dev') {
        rollbar = new Rollbar({
            accessToken: process.env.ROLLBAR_TOKEN,
            captureUncaught: true,
            captureUnhandledRejections: true,
            payload: { environment: process.env.NODE_ENV }
        });
    }
    return rollbar;
};
exports.error = (error) => {
    if (process.env.NODE_ENV === 'dev') {
        console.error('dev err...', error);
    }
    else {
        exports.rollbar().error(error);
    }
};
//# sourceMappingURL=logger.js.map