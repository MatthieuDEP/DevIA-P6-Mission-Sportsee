export function getDataSource() {
  return (process.env.DATA_SOURCE || "mock").toLowerCase();
}

export function isMock() {
  return getDataSource() === "mock";
}