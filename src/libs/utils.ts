export function getTime() {
  return Math.floor(Date.now() / 1000);
}

export function isValidId(id: number) {
  return id % 1 === 0 && id < 2147483647;
}
