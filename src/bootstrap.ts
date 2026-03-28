import { WorkerBridge } from "./bridge/workerBridge"
import { WorkerContext } from "./context/workerContext"

export async function bootstrapWorker(config: {
  worker: Worker | SharedWorker
  name?: string
  modules?: any[]
}) {

  const bridge = new WorkerBridge(config.worker)

  WorkerContext.setBridge(bridge, config.name)

  if (config.modules) {

    const moduleNames = config.modules.map(m => m.name)

    // WAIT for initialization
    await bridge.dispatch("worker.init", moduleNames)

  }

  return bridge
}