export const stream = result => {
  const xhr = result.event.target
  const { responseText } = xhr
  return responseText
    .split('data: ')
    .map(text => {
      if (!text) return ''
      const lastIndex = text.lastIndexOf('}')
      let chunk = text
      if (lastIndex !== -1) chunk = text.slice(0, lastIndex + 1)
      try {
        return JSON.parse(chunk)
      } catch (error) {
        return ''
      }
    })
    .filter(item => item)
}

export const formatNormal = (list): { text: string } => {
  return list.reduce(
    (result, item) => {
      Object.assign(result, item)
      result.text += item.answer || ''
      if (item.event === 'message_replace') result.text = item.answer

      return result
    },
    { text: '' }
  )
}
