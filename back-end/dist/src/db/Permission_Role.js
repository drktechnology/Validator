"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const PermissionSchema_1 = require("./schema/PermissionSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return PermissionSchema_1.PermissionRole;
    }
    getName() {
        return 'permission_role';
    }
}
exports.default = default_1;
//# sourceMappingURL=Permission_Role.js.map