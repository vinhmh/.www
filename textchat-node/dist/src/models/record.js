"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Record {
  constructor() {
    _defineProperty(this, "update", data => {
      Object.keys(this).forEach(prop => {
        if (!data.hasOwnProperty(prop)) return;
        this[prop] = JSON.parse(JSON.stringify(data[prop]));
      });
      this.onUpdate();
    });
  }

  onUpdate() {// overwrite in child class
  }

  static find(data) {
    if (!data) return;

    if (data instanceof Object) {
      let equal;
      return this.all.find(instance => {
        equal = true; // eslint-disable-next-line no-restricted-syntax

        for (const key of Object.keys(data)) {
          if (data[key] !== instance[key]) {
            equal = false;
            break;
          }
        }

        return equal;
      });
    }

    return this.all.find(record => record.id === data);
  }

}

exports.default = Record;