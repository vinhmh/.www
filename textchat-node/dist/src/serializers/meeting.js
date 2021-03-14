"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _default = (meeting, options = {}) => {
  const result = {
    id: meeting.id,
    title: meeting.title,
    conferences: meeting.conferences,
    type: meeting.type,
    hash: meeting.hash,
    createdBy: meeting.createdBy
  };
  return result;
};

exports.default = _default;