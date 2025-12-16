export const sleep = (time): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time)
  })
}
