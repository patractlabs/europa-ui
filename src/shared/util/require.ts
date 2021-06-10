export function requireModule(moduleName: string) {
  return (window as any).require(moduleName);
}
requireModule.isElectron = (window as any).require instanceof Function;