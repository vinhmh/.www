export default class Record {
  constructor(data) {
    this.data = data
  }

  update = (data) => {
    Object.keys(this).forEach((prop) => {
      if (!data.hasOwnProperty(prop)) return
      this[prop] = JSON.parse(JSON.stringify(data[prop]))
    })
    this.onUpdate()
  };

  onUpdate() {
    // overwrite in child class
  }

  static find(data) {
    if (!data) return
    if (data instanceof Object) {
      let equal
      return this.all.find((instance) => {
        equal = true
        for (const key of Object.keys(data)) {
          if (data[key] !== instance[key]) {
            equal = false
            break
          }
        }
        return equal
      })
    }
    return this.all.find(record => record.id === data)
  }
}
