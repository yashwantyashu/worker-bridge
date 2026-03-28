import { WorkerRouter } from "./workerRouter"

export const router = new WorkerRouter()

let ports: MessagePort[] = []
const state: Record<string, any> = {}

export function getState(key: string) { return state[key] }
export function getAllState() { return state }

// registry of available module classes
const moduleRegistry: Record<string, any> = {}
const instances: Record<string, any> = {}

// Forward logs to main thread
const originalLog = console.log
const originalWarn = console.warn
const originalError = console.error

const logBuffer: {type: string, args: any[]}[] = []

const forwardLog = (type: string, ...args: any[]) => {
  if (ports.length === 0) {
    logBuffer.push({ type, args })
    return
  }
  ports.forEach(port => {
    port.postMessage({
      eventName: "worker.log",
      eventPayload: { type, args }
    })
  })
}

console.log = (...args: any[]) => {
  originalLog.apply(console, args)
  forwardLog("log", ...args)
}

console.warn = (...args: any[]) => {
  originalWarn.apply(console, args)
  forwardLog("warn", ...args)
}

console.error = (...args: any[]) => {
  originalError.apply(console, args)
  forwardLog("error", ...args)
}

export function registerModuleClass(name: string, moduleClass: any) {
  moduleRegistry[name] = moduleClass
}

export function startWorker(modules: any[]) {
  modules.forEach(Module => {
    registerModuleClass(Module.name, Module)
  })
}

export function setState(key: string, value: any) {
  state[key] = value
  const message = {
    eventName: "state:" + key,
    eventPayload: value
  }
  
  // Broadcast to all connected ports (Shared Worker)
  if (ports.length > 0) {
    ports.forEach(port => port.postMessage(message))
  } else {
    // Only use self.postMessage in Regular Workers
    self.postMessage(message)
  }
}

// public helper so registerModule.ts (and others) can register handlers
// without needing a direct reference to the router instance
export function registerHandler(command: string, handler: Function) {
  router.register(command, handler)
}

// actual registration into router
export function initModules(moduleNames: string[]) {

  moduleNames.forEach(name => {

    const ModuleClass = moduleRegistry[name]

    if (!ModuleClass) {
      console.warn("Module not found:", name)
      return
    }

    // Only create an instance if one doesn't already exist
    if (!instances[name]) {
      instances[name] = new ModuleClass()
    }
    const instance = instances[name]

    const proto = Object.getPrototypeOf(instance)

    const methods = Object.getOwnPropertyNames(proto)

    const namespace = name
        .replace(/^_+/, "") // strip leading underscores
        .replace("Module", "")
        .toLowerCase()

    methods.forEach(methodName => {

      if (methodName === "constructor") return

      const handler = instance[methodName].bind(instance)

      const command = namespace + "." + methodName

      router.register(command, handler)

    })

  })

}

const setupPort = (port: MessagePort | any) => {

  ports.push(port)

  // send existing state to new tab
  Object.keys(getAllState()).forEach(key => {
    const value = getState(key)

    if (value !== undefined) {
      port.postMessage({
        eventName: `state:${key}`,
        eventPayload: value
      })
    }
  })

  // replay buffered logs
  if (logBuffer.length > 0) {
    logBuffer.forEach(log => {
      port.postMessage({
        eventName: "worker.log",
        eventPayload: { type: log.type, args: log.args }
      })
    })
    logBuffer.length = 0
  }

  // Initial state sync for new ports
  Object.keys(state).forEach(key => {
    port.postMessage({
      eventName: "state:" + key,
      eventPayload: state[key]
    })
  })

  port.onmessage = async (event: any) => {

    const { id, command, payload } = event.data

    try {

      // handle init FIRST
      if (command === "worker.init") {

        initModules(payload)

        port.postMessage({
          id,
          success: true,
          result: "initialized"
        })

        return
      }

      const result = await router.handle(command, payload)

      port.postMessage({
        id,
        success: true,
        result
      })

    } catch (error: any) {

      port.postMessage({
        id,
        success: false,
        error: error?.message || "Worker error"
      })

    }

  }

}

// Shared Worker support
if ('onconnect' in self) {
  self.onconnect = (event: any) => {
    setupPort(event.ports[0])
  }
} else {
  // Regular Worker support
  setupPort(self)
}
