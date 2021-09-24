"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../Base");
const get_1 = require("./get");
const login_1 = require("./login");
const register_1 = require("./register");
const update_1 = require("./update");
const updateRole_1 = require("./updateRole");
const current_user_1 = require("./current_user");
const send_email_1 = require("./send_email");
const send_reg_email_1 = require("./send_reg_email");
const send_confirm_email_1 = require("./send_confirm_email");
const check_email_1 = require("./check_email");
const change_password_1 = require("./change_password");
const forgot_password_1 = require("./forgot_password");
const reset_password_1 = require("./reset_password");
const list_users_1 = require("./list_users");
const getCouncilMembers_1 = require("./getCouncilMembers");
const comment_1 = require("./comment");
const subscribe_1 = require("./subscribe");
const unsubscribe_1 = require("./unsubscribe");
const logout_1 = require("./logout");
exports.default = Base_1.default.setRouter([
    {
        path: '/logout',
        router: logout_1.default,
        method: 'get'
    },
    {
        path: '/login',
        router: login_1.default,
        method: 'get'
    },
    {
        path: '/register',
        router: register_1.default,
        method: 'post'
    },
    {
        path: '/:userId',
        router: update_1.default,
        method: 'put'
    },
    {
        path: '/:userId/updateRole',
        router: updateRole_1.default,
        method: 'put'
    },
    {
        path: '/public/:userId',
        router: get_1.default,
        method: 'get'
    },
    {
        path: '/send-email',
        router: send_email_1.default,
        method: 'post'
    },
    {
        path: '/send-code',
        router: send_reg_email_1.default,
        method: 'post'
    },
    {
        path: '/send-confirm',
        router: send_confirm_email_1.default,
        method: 'post'
    },
    {
        path: '/check-email',
        router: check_email_1.default,
        method: 'post'
    },
    {
        path: '/current_user',
        router: current_user_1.default,
        method: 'get'
    },
    {
        path: '/change_password',
        router: change_password_1.default,
        method: 'get'
    },
    {
        path: '/forgot-password',
        router: forgot_password_1.default,
        method: 'post'
    },
    {
        path: '/reset-password',
        router: reset_password_1.default,
        method: 'post'
    },
    {
        path: '/:userIds/users',
        router: list_users_1.default,
        method: 'get'
    },
    {
        path: '/list',
        router: list_users_1.default,
        method: 'get'
    },
    {
        path: '/getCouncilMembers',
        router: getCouncilMembers_1.default,
        method: 'get'
    },
    {
        path: '/:id/comment',
        router: comment_1.default,
        method: 'post'
    },
    {
        path: '/:id/subscribe',
        router: subscribe_1.default,
        method: 'post'
    },
    {
        path: '/:id/unsubscribe',
        router: unsubscribe_1.default,
        method: 'post'
    }
]);
//# sourceMappingURL=index.js.map