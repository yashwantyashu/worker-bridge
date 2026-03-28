export * from "./bridge/workerBridge"
export * from "./worker/workerStore"
export * from "./worker/workerRuntime"
export * from "./decorators/runInWorker"
export * from "./providers"

export function helloWorkerBridge() {
  console.log('worker started')
  return "worker bridge alive";
}