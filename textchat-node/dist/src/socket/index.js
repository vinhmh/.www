"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Admin", {
  enumerable: true,
  get: function () {
    return _admin.default;
  }
});
Object.defineProperty(exports, "AdminSender", {
  enumerable: true,
  get: function () {
    return _admin.AdminSender;
  }
});
Object.defineProperty(exports, "Client", {
  enumerable: true,
  get: function () {
    return _client.default;
  }
});
Object.defineProperty(exports, "Sender", {
  enumerable: true,
  get: function () {
    return _client.Sender;
  }
});
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function () {
    return _socket.default;
  }
});

var _admin = _interopRequireWildcard(require("./admin"));

var _client = _interopRequireWildcard(require("./client"));

var _socket = _interopRequireDefault(require("./socket"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }