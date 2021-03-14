"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBoolean = exports.shortName = exports.displayName = void 0;

const ucFirst = str => str.charAt(0).toUpperCase() + str.slice(1);

const displayName = string => string.split('_').map(name => ucFirst(name)).join(' ');

exports.displayName = displayName;

const shortName = string => {
  if (string.match('-')) {
    return string.split(' ').map(name => {
      if (name.match('-')) return name.split('-').map(n => `${n.charAt(0).toUpperCase()}.`).join('');
      return name;
    });
  }

  const words = string.split(' ');
  const lastIndex = words.length - 1;
  const last = words[lastIndex];
  words[lastIndex] = `${last.charAt(0).toUpperCase()}.`;
  return words.join(' ');
};

exports.shortName = shortName;

const getBoolean = value => {
  switch (value) {
    case true:
    case 'true':
    case 1:
    case '1':
    case 'on':
    case 'yes':
      return true;

    default:
      return false;
  }
};

exports.getBoolean = getBoolean;