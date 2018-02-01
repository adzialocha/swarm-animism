export function randomRange(min, max) {
  return (Math.random() * (max - min)) + min
}

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
