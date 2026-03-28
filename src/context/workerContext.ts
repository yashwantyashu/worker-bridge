import { WorkerBridge } from "../bridge/workerBridge"

export class WorkerContext {

  private static bridges = new Map<string, WorkerBridge>()

  static setBridge(bridge: WorkerBridge, name: string = "default"){
    this.bridges.set(name, bridge)
  }

  static getBridge(name: string = "default"): WorkerBridge {

    const bridge = this.bridges.get(name)

    if(!bridge){
      throw new Error(`WorkerBridge '${name}' not initialized`)
    }

    return bridge
  }

}