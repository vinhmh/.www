"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usersAll = void 0;

var _admin = _interopRequireDefault(require("./admin"));

var _user = _interopRequireDefault(require("../../models/user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const usersAll = () => {
  _admin.default.broadcast(_admin.default.USERS_ALL, {
    data: _user.default.all
  });
};

exports.usersAll = usersAll;