import { WorkerContext } from "../context/workerContext"

export function RunInWorker(options?: { bridge?: string, namespace?: string }) {

  const bridgeName = options?.bridge || "default"

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    descriptor.value = function (...args: any[]) {

      const className = target.constructor.name
      
      const namespace = options?.namespace || className
          .replace(/^_+/, "") // strip leading underscores
          .replace("Service", "")
          .toLowerCase()

      const command = namespace + "." + propertyKey

      return WorkerContext
        .getBridge(bridgeName)
        .dispatch(command, args)

    }

  }

}