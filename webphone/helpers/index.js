export const deepCopy = (o) => {
  let i
  let newO

  if (typeof o !== 'object') return o
  if (!o) return o

  if (Object.prototype.toString.apply(o) === '[object Array]') {
    newO = []
    for (i = 0; i < o.length; i += 1) {
      newO[i] = deepCopy(o[i])
    }
    return newO
  }

  newO = {}
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newO[i] = deepCopy(o[i])
    }
  }
  return newO
}
export const isMobileDevice = () => (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1)
export const isTabletDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent)
}

export const BrowserType = { safari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent) }

export const objChanged = function (old, obj) {
  return JSON.stringify(old) !== JSON.stringify(obj)
}
