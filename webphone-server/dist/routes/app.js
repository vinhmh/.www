"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _express = _interopRequireDefault(require("express"));

var _querystring = _interopRequireDefault(require("querystring"));

var _cors = _interopRequireDefault(require("cors"));

var _xml2js = require("xml2js");

var _sha = _interopRequireDefault(require("sha1"));

var _config = _interopRequireWildcard(require("../config"));

var _bbb = require("../services/bbb");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

const router = _express.default.Router();

const bbbJoin = async (fullName, meetingID) => {
  const {
    bbb_secret,
    host
  } = _config.default;
  let joinUrl;
  let password;

  const join = () => {
    if (meetingID && password && meetingID.length && password.length) {
      const query = _querystring.default.stringify({
        fullName,
        meetingID,
        password
      });

      const checksum = (0, _sha.default)(`join${query}${bbb_secret}`);
      joinUrl = `${host}/join?${query}&checksum=${checksum}`;
    }

    return {
      joinUrl
    };
  };

  if (!meetingID) return join();
  const meetingQuery = `meetingID=${meetingID}`;

  try {
    const {
      data
    } = await (0, _bbb.getMeetingInfo)(meetingQuery);

    if (data.response) {
      const {
        returncode,
        message
      } = data.response;

      if (returncode === 'FAILED') {
        throw new Error(message);
      }
    }

    password = await new Promise((resolve, reject) => (0, _xml2js.parseString)(data, {
      explicitRoot: false,
      explicitArray: false
    }, (err, parsed) => !err ? resolve(parsed.moderatorPW) : reject(err)));
    return join();
  } catch (err) {
    console.error(err);
    return {
      error: `There isn't an active meeting with ID ${meetingID}. Please retry with an existing meeting.`
    };
  }
};

const render = async (req, res, template, locals) => {
  const data = await (0, _bbb.getMeetings)();
  (0, _xml2js.parseString)(data.data, {
    explicitRoot: false,
    explicitArray: false
  }, (err, data) => {
    let meetings = [];

    if (!err) {
      meetings = Array.isArray(data.meetings) ? data.meetings : [data.meetings];
    } else {
      console.error(err);
    }

    return res.render(template, _objectSpread(_objectSpread({}, meetings), locals));
  });
};

router.get('/', async (req, res) => {
  if (['citeo.ibridgepeople.fr'].indexOf(req.hostname) !== -1) {
    const meeting = _config.confMap.meetings.Citeo19062019;
    const conferences = meeting.conferences.filter(c => c.accessible);

    if (conferences.length === 1) {
      const conference = conferences[0];
      return res.redirect(`${_config.default.webphoneUrl}?cf1=${conference.number}&username=citeo_user&meetingID=Citeo19062019`);
    }

    return render(req, res, 'app/connect/citeo');
  }

  if (['citeo.ibridgepeople.fr'].indexOf(req.hostname) !== -1) {
    const meeting = _config.confMap.meetings.Citeo19062019;
    const conferences = meeting.conferences.filter(c => c.accessible);

    if (conferences.length === 1) {
      const conference = conferences[0];
      return res.redirect(`${_config.default.webphoneUrl}?cf1=${conference.number}&username=demo_user&meetingID=Citeo19062019`);
    }

    return render(req, res, 'app/connect/sustain');
  }

  res.redirect('/connect');
});
router.get('/connect', (req, res) => {
  const {
    meetingID,
    language1,
    name
  } = req.query;
  return render(req, res, 'app/connect/regular', {
    meetingID,
    language1,
    name
  });
});
router.get('/connect/coordinator', (req, res) => {
  const {
    meetingID,
    language1,
    name,
    coordinator
  } = req.query;
  return render(req, res, 'app/connect/coordinator', {
    meetingID,
    language1,
    name,
    coordinator
  });
});
router.get('/showcase', (req, res) => render(req, res, 'app/connect/showcase'));
router.get('/demo', (req, res) => render(req, res, 'app/connect/demo'));
router.get('/connect/interpreter', (req, res) => {
  const {
    meetingID,
    language1,
    language2,
    password,
    name
  } = req.query;
  return render(req, res, 'app/connect/interpreter', {
    meetingID,
    language1,
    language2,
    password,
    name
  });
});
router.get('/connect/tablet', (req, res) => {
  const {
    meetingID,
    name
  } = req.query;
  return render(req, res, 'app/connect/tablet', {
    meetingID,
    name
  });
});
router.get('/connect/multimedia', (req, res) => {
  const {
    meetingID,
    name
  } = req.query;
  return render(req, res, 'app/connect/multimedia', {
    meetingID,
    name
  });
});
router.use('/bbbPage', (req, res) => {
  const {
    joinUrl
  } = req.query;
  return res.render('app/bbbPage', {
    joinUrl
  });
});
router.get('/listDevices', (req, res) => res.sendFile('public/media_devices.html', {
  root: _config.default.rootPath
}));
router.post('/meetingConferences', (0, _cors.default)(), (req, res) => {
  const {
    title,
    role
  } = req.body;
  const meeting = _config.confMap.meetings[title];
  if (!meeting) return res.json(null);
  const map = meeting.conferences.filter(c => role !== 'regular' || c.accessible);
  res.json(map);
});
router.get('/getMeetingData', async (req, res) => {
  const {
    meetingID,
    username,
    secretToken
  } = req.query;
  if (secretToken !== _config.default.secretToken) return res.status(404);
  const meeting = _config.confMap.meetings[meetingID];
  const response = {
    meeting
  };

  if (username) {
    const bbb = await bbbJoin(username, meetingID);
    response.bbb = bbb;
  }

  res.json(response);
});
const _default = router;
var _default2 = _default;
exports.default = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/vinhmh/Project/dev/.www/webphone-server/routes/app.js");
  reactHotLoader.register(bbbJoin, "bbbJoin", "/home/vinhmh/Project/dev/.www/webphone-server/routes/app.js");
  reactHotLoader.register(render, "render", "/home/vinhmh/Project/dev/.www/webphone-server/routes/app.js");
  reactHotLoader.register(_default, "default", "/home/vinhmh/Project/dev/.www/webphone-server/routes/app.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();