import { Observable } from "schema-node-core";

let debugMode = localStorage.getItem('debugMode') === 'true';
const debugModeObserver = new Observable<[boolean]>();

export function subscribeDebugMode(observer: (debugMode: boolean) => void, immediate?: boolean): Function {
  if (immediate) observer(debugMode);
  return debugModeObserver.subscribe((debugMode) => observer(debugMode));
}

export function setDebugMode(debugMode: boolean): void {
  debugMode = debugMode ? true : false;
  localStorage.setItem('debugMode', debugMode.toString());
  debugModeObserver.onNext(debugMode);
}