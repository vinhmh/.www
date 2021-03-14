import { saveAs } from 'file-saver'

export const saveToFile = (logs, id) => {
  const stringified = logs.map(log => {
    if (typeof (log) === 'string') {
      return log
    } else {
      return JSON.stringify(log)
    }
  })
  var blob = new Blob([stringified.join('\r\n')], { type: "text/plain;charset=utf-8" })
  saveAs(blob, `janus_${id}_${Date.now()}.log`)
}