/**
 * Formats milliseconds to a readable time format
 *
 * @param duration
 */
export default (duration: number): string => {
  let remain = duration || 0

  let days = Math.floor(remain / (1000 * 60 * 60 * 24))
  remain = remain % (1000 * 60 * 60 * 24)

  let hours = Math.floor(remain / (1000 * 60 * 60))
  remain = remain % (1000 * 60 * 60)

  let minutes = Math.floor(remain / (1000 * 60))
  remain = remain % (1000 * 60)

  let seconds = Math.floor(remain / (1000))

  let parts = []
  if (days) {
    let ret = days + ' day'
    if (days !== 1) {
      ret += 's'
    }

    parts.push(ret)
  }

  if (hours) {
    let ret = hours + ' hour'
    if (hours !== 1) {
      ret += 's'
    }

    parts.push(ret)
  }

  if (minutes) {
    let ret = minutes + ' minute'
    if (minutes !== 1) {
      ret += 's'
    }

    parts.push(ret)

  }

  if (seconds) {
    let ret = seconds + ' second'
    if (seconds !== 1) {
      ret += 's'
    }

    parts.push(ret)
  }

  if (parts.length === 0) {
    return null

  } else {
    return parts.join(' ')
  }
}
