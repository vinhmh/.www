export const ISSUES_FILTER = {
  NO_FILTER: 'no filter',
  ANY: 'all',
}

export const ROLES_FILTER = {
  ALL: 'all',
  MODERATOR: 'moderator',
  REGULAR: 'regular',
  SWITCHER: 'switcher'
}

export const ROLES_DISPLAY_TYPE = {
  INTERPRETER: 'interpreter',
  PARTICIPANT: 'participant',
}

export const BOOTH_TYPE = {
  FLOOR: 'Floor',
  LOUNGE: 'Lounge'
}

export const ADJUSTMENTS = {
  DEMOMODE: 'demoMode'
}

export const OS_NAME = {
  MACOS: "MacOS",
  WINDOWS: "Windows",
  IOS: "iOS",
  ANDROID: "Android"
}

export const BROWSER_NAME = {
  CHROME: "Chrome",
  SAFARI: "Safari",
  FIREFOX: "Firefox",
  EDGE: "Edge"
}

export const DEVICE_KIND = {
  AUDIOINPUT: 'audioinput',
  AUDIOOUTPUT: 'audiooutput',
  VIDEOINPUT: 'videoinput'
}

export const DEVICE_TYPE = {
  MICROPHONE: 'microphone',
  CAMERA: 'camera',
  SPEAKER: 'speaker',
  UNKNOWN: 'unknown'
}

const resolveOSName = (name) => {
  if (name.match(/Mac|OS X/)) {
    return OS_NAME.MACOS
  }
  if (name.match(/iOS/)) {
    return OS_NAME.IOS;
  }
  if (name.match(/Android/)) {
    return OS_NAME.ANDROID;
  }
  if (name.match(/Windows/)) {
    return OS_NAME.WINDOWS;
  }
  return name;
}

const resolveOSVersion = (version) => {
  if (!version) {
    return "-"
  }
  const versionParts = version.split(".");
  if (versionParts.length >= 2) {
    return Number(`${versionParts[0]}.${versionParts[1]}`)
  } else {
    return Number(version || "0.0");
  }
}

const resolveBrowserName = (name) => {
  // In case 'Microsoft Edge' instead of 'Edge'
  if (name.split(" ").length > 1) {
    return name.split(" ")[1];
  }
  return name;
}

export const isBrowserSupported = (browser) => {

  if (!browser) {
    return false;
  }

  const browserName = resolveBrowserName(browser.name), browserMajorVersion = browser.major

  if (!browserName || !browserMajorVersion) {
    return false;
  }

  if (CONFIG.browserMinimalVersion) {
    const browsersSupported = CONFIG.browserMinimalVersion;

    if (!(browserName in browsersSupported)) {
      return false;
    }
    return browserMajorVersion >= browsersSupported[browserName];
  } else {
    // To remove when new configuration will be deployed
    if (browserName.includes(BROWSER_NAME.SAFARI) && browserMajorVersion >= 13) {
      return true;
    }
  
    if (browserName.includes(BROWSER_NAME.CHROME) && browserMajorVersion >= 80) {
      return true;
    }
  
    if (browserName.includes(BROWSER_NAME.FIREFOX) && browserMajorVersion >= 78) {
      return true;
    }
  
    if (browserName.includes(BROWSER_NAME.EDGE) && browserMajorVersion >= 80) {
      return true;
    }
  
    return false;
  }
}

export const isSystemSupported = (os) => {
  if (!os) {
    return false;
  }

  const osVersion = resolveOSVersion(os.version);
  const osName = resolveOSName(os.name);

  if (CONFIG.systemMinimalVersion) {
    const systemsSupported = CONFIG.systemMinimalVersion;

    if (!(osName in systemsSupported)) {
      return false;
    }
    return osVersion >= systemsSupported[osName] || 0;
  } else {
    // To remove when new configuration will be deployed
    if (osName === OS_NAME.MACOS && osVersion >= 10.13) {
      return true;
    }
  
    if (osName === OS_NAME.IOS && osVersionMajor >= 13) {
      return true;
    }
  
    if (osName === OS_NAME.ANDROID && osVersionMajor >= 9) {
      return true;
    }
    if (osName === OS_NAME.WINDOWS && osVersionMajor >= 7) {
      return true;
    }
  }
  return false;
}

export const hasAudioDevice = (mediaSettings) => {

  if (!mediaSettings) {
    return false
  }

  const { audioInputId, devices } = mediaSettings

  if (!devices || devices.length === 0 || audioInputId === null) {
    return false
  }
  return true
}

export const hasOnlyHostCandidate = (candidates) => {
  if (!candidates) {
    return false
  }
  return (candidates.filter(candidate => ("type" in candidate && candidate.type !== "host")).length === 0)
}

export const getDeviceNameFromId = (id, devicesList, kind) => {
  if (!devicesList) {
    return null
  }

  let deviceFound = null
  
  deviceFound = devicesList.find((device) => {
    return device.deviceId === id && device.kind === kind;
  });

  if (!deviceFound) {
    return null;
  }

  return deviceFound.label.replace(/ \(\w{4}:\w{4}\)$/g, '');
}

export const uniq = (devices, kind) => {
  const arr = [];

  let defaultInternalLabelId = "";
  let regExp = new RegExp(/\(\w{4}:\w{4}\)$/g);   // Get internal label ref. Eg: (32e2:15be) - Used in Chrome

  devices.filter((device => (device.kind === kind))).forEach((device) => {

    let internalLabelId = "";
    let checkForInternalLabel = regExp.exec(device.label);

    if (checkForInternalLabel) {
      internalLabelId = checkForInternalLabel[0];
    }
    checkForInternalLabel = null;

    // Get default internal label Id and remove that device from the list
    if (device.deviceId === "default") {
      defaultInternalLabelId = internalLabelId
      return;
    }

    // remove duplicate (same id and same kind)
    if (arr.find((d) => d.deviceId === device.deviceId && d.kind === device.kind)) {
      return;
    }

    const updatedDevice = { ...device }

    // Put device has default if there is a default device
    if (defaultInternalLabelId.length > 0) {
      updatedDevice.hasDefault = true;
      if (device.label.includes(defaultInternalLabelId)) {
        updatedDevice.isDefault = true;
      } else {
        updatedDevice.isDefault = false;
      }
    } else {
      updatedDevice.hasDefault = false;
      updatedDevice.isDefault = false;
    }

    arr.push(updatedDevice);
  });

  return arr;
};

export const getEquipmentType = (os) => {
  let value = { icon: 'question', text: 'unknown', color: 'red' }

  if (os) {
    if (os.name.match(/Android|iOS/)) {
      value.icon = 'mobile alternate'
      value.text = 'Tablet/Phone'
      value.color = 'orange'
    }
    else if (os.name.match(/Windows|Linux|Mac|Chromium|OS X/)) {
      value.icon = 'laptop'
      value.text = 'Computer'
      value.color = 'grey'
    }
  }

  return value
}

export const isOnTabletOrPhone = (os) => {
  if (!os) {
    return false
  }

  return (os.name.match(/Android|iOS/) || false)
}

export const getEquipmentBrowser = (browser) => {
  let value = { icon: 'question', text: 'Not detected', color: 'orange', version: 'Not detected', supported: false, known: false }

  if (browser) {
    value.version = browser.version || "Not detected"
    value.text = browser.name || "Not detected"
    value.color = 'yellow'
    value.supported = isBrowserSupported(browser)
    if (browser.name.match(/Safari/)) {
      value.known = true;
      value.icon = "safari";
    } else if (browser.name.match(/Chrome/)) {
      value.known = true;
      value.icon = "chrome";
    } else if (browser.name.match(/Firefox/)) {
      value.known = true;
      value.icon = "firefox";
    } else if (browser.name.match(/Edge/)) {
      value.icon = "edge";
      value.known = true;
    } else if (browser.name.match(/Opera/)) {
      value.icon = "opera";
      value.known = true;
    }
  }

  return value
}

export const getEquipmentSystem = (os) => {
  let value = { icon: 'question', text: 'Not detected', color: 'orange', version: 'Not detected', supported: false, known: false }

  if (os) {
    value.text = os.name || "Not detected"
    value.version = os.version || "Not detected"
    value.color = 'yellow'
    value.supported = isSystemSupported(os)

    if (os.name.match(/Mac|OS X|iOS/)) {
      value.icon = "apple";
      value.known = true;
    } else if (os.name.match(/Android/)) {
      value.icon = "android";
      value.known = true;
    } else if (os.name.match(/Windows/)) {
      value.icon = "windows";
      value.known = true;
    } else if (os.name.match(/Chromium/)) {
      value.icon = "chrome";
      value.known = true;
    } else if (os.name.match(/Linux|Cent|suse|redhat|fedora/)) {
      value.icon = "linux";
      value.known = true;
    }
  }

  return value
}

export const getNetworkCandidates = (turnStun) => {
  let value = { iconHost: 'shield', iconStun: 'shield', iconTurn: 'shield', nbHost: 0, nbStun: 0, nbTurn: 0, hasError: true }

  if (turnStun) {
    value.nbHost = turnStun.filter(candidate => (candidate.type === 'host')).length
    value.nbStun = turnStun.filter(candidate => (candidate.type === 'srflx')).length
    value.nbTurn = turnStun.filter(candidate => (candidate.type === 'relay')).length
    if (value.nbTurn + value.nbStun > 0) {
      value.hasError = false
    }
    if (value.nbHost > 0) {
      value.iconHost = 'sitemap'
    }
    if (value.nbStun > 0) {
      value.iconStun = 'sitemap'
    }
    if (value.nbTurn > 0) {
      value.iconTurn = 'sitemap'
    }
  }
  return value
}

export const getCollaborationTool = (user) => {
  let value = { icon: 'desktop', text: 'None', color: 'grey', used: false, supported: false }

  if (user.bbb && user.bbb.joinUrl) {
    value.text = "BBB"
    value.supported = true
  } else if (user.platformUrl) {
    value.supported = true
    if (user.platformUrl.match(/zoom/)) {
      value.text = "Zoom"
    } else {
      value.text = "Other"
    }
  }

  if ('bbbStatus' in user) {
    value.used = user.bbbStatus
    if (user.bbbStatus) {
      value.color = "blue"
    } else {
      value.color = "grey"
    }
  }

  return value
}

export const isCollaborationUsed = (user) => {
  return ('bbbStatus' in user && user.bbbStatus)
}

export const getEquipmentAudio = (mediaSettings) => {

  let value = {
    textInput: 'Not detected',
    textOutput: 'Not detected',
    nbInput: 0,
    nbOutput: 0,
    supportedIntput: false,
    supportedOutput: false,
  }

  if (mediaSettings) {
    const { audioInputId, audioOutputId, devices } = mediaSettings

    if (!devices || devices.length === 0) {
      return value
    } 

    const audioInputDevices = devices ? devices.filter(device => (device.kind === 'audioinput')) : []
    const audioOutputDevices = devices ? devices.filter(device => (device.kind === 'audiooutput')) : []

    value.textInput = getDeviceNameFromId(audioInputId, audioInputDevices, "audioinput") || 'Not detected'
    value.textOutput = getDeviceNameFromId(audioOutputId, audioOutputDevices, "audiooutput") || 'Not detected'

    if (audioInputId) {
      value.supportedIntput = true
      value.nbInput = audioInputDevices.length
    }

    if (audioOutputId) {
      value.supportedOutput = true
      value.nbOutput = audioOutputDevices.length
    }
  }

  return value
}

export const getPhoneStatus = (user) => {
  let value = {
    isConnected: user.connected,
    isRegistered: user.registered,
    text: 'Not connected'
  }

  if (user?.connected && user?.registered) {
    value.text = 'Connected'
  } else if (user?.registered) {
    value.text = 'Registered'
  }
  return value
}

export const getDeviceType = (kind) => {
  switch (kind) {
    case DEVICE_KIND.AUDIOINPUT:
      return DEVICE_TYPE.MICROPHONE
    case DEVICE_KIND.AUDIOOUTPUT:
      return DEVICE_TYPE.SPEAKER
    case DEVICE_KIND.VIDEOINPUT:
      return DEVICE_TYPE.CAMERA
    default:
      return DEVICE_TYPE.UNKNOWN
  }
}

