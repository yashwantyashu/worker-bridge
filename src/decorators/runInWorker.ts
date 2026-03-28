import { WorkerContext } from "../context/workerContext"

export function RunInWorker(options?: { bridge?: string, namespace?: string }) {

  const bridgeName = options?.bridge || "default"

  return function (targetOrValue: any, contextOrKey: any, maybeDescriptor?: any) {

    // 1. LEGACY (Experimental) Format
    if (typeof contextOrKey === "string") {
      const propertyKey = contextOrKey
      const descriptor = maybeDescriptor

      descriptor.value = function (...args: any[]) {
        const className = this.constructor.name
        
        const namespace = options?.namespace || className
            .replace(/^_+/, "") // strip leading underscores
            .replace("Service", "")
            .toLowerCase()

        const command = namespace + "." + propertyKey

        return WorkerContext
          .getBridge(bridgeName)
          .dispatch(command, args)
      }
      return descriptor
    }

    // 2. STAGE 3 (Modern) Format
    const methodName = contextOrKey.name
    
    return function (this: any, ...args: any[]) {
      const className = this.constructor.name
      
      const namespace = options?.namespace || className
          .replace(/^_+/, "") // strip leading underscores
          .replace("Service", "")
          .toLowerCase()

      const command = namespace + "." + methodName

      return WorkerContext
        .getBridge(bridgeName)
        .dispatch(command, args)
    }

  }

}