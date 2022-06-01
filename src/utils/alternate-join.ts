export const alternateJoin = (data:string[]|undefined) => {
  if (!data || data.length === 0) {
    return ''
  } else if (data.length === 1) {
    return data[0]
  } else if (data.length === 2) {
    return `${data[0]} dan ${data[1]}`
  } else {
    return `${data.slice(0, data.length - 1).join(', ')}, dan ${data[data.length - 1]}`
  }
}
