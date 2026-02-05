let globalData = {
  isLoaded: false
};

export function setGlobalData(data) {
  globalData = { ...globalData, ...data, isLoaded: true };
}

export function getGlobalData() {
  return globalData;
}
