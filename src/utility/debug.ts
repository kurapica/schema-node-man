import { Observable } from "schema-node-core";

let debugMode = localStorage.getItem('debugMode') === 'true';
const debugModeObserver = new Observable<[boolean]>();

export function subscribeDebugMode(observer: (debugMode: boolean) => void, immediate?: boolean): Function {
  const handler = debugModeObserver.subscribe((debugMode) => observer(debugMode));
  if (immediate) observer(debugMode);
  return handler;
}

export function setDebugMode(debugMode: boolean): void {
  debugMode = debugMode ? true : false;
  localStorage.setItem('debugMode', debugMode.toString());
  debugModeObserver.onNext(debugMode);
}