"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../Base");
const add_member_1 = require("./add_member");
const remove_member_1 = require("./remove_member");
const list_member_1 = require("./list_member");
const get_1 = require("./get");
const create_1 = require("./create");
const update_1 = require("./update");
const get_with_country_1 = require("./get_with_country");
const get_child_1 = require("./get_child");
const delete_1 = require("./delete");
const get_all_1 = require("./get_all");
const get_communities_with_user_1 = require("./get_communities_with_user");
exports.default = Base_1.default.setRouter([
    {
        path: '/',
        router: get_1.default,
        method: 'get'
    },
    {
        path: '/all',
        router: get_all_1.default,
        method: 'get'
    },
    {
        path: '/:communityId',
        router: get_1.default,
        method: 'get'
    },
    {
        path: '/:communityId',
        router: delete_1.default,
        method: 'delete'
    },
    {
        path: '/create',
        router: create_1.default,
        method: 'post'
    },
    {
        path: '/:communityId/members',
        router: list_member_1.default,
        method: 'get'
    },
    {
        path: '/:communityId/:userId',
        router: add_member_1.default,
        method: 'post'
    },
    {
        path: '/:communityId/:userId',
        router: remove_member_1.default,
        method: 'delete'
    },
    {
        path: '/update',
        router: update_1.default,
        method: 'put'
    },
    {
        path: '/country/:countryName',
        router: get_with_country_1.default,
        method: 'get'
    },
    {
        path: '/parent/:communityId',
        router: get_child_1.default,
        method: 'get'
    },
    {
        path: '/:userId/communities',
        router: get_communities_with_user_1.default,
        method: 'get'
    }
]);
//# sourceMappingURL=index.js.map