import { Subject } from "rxjs"

const DEBUG = false

export class WorkerBridge {

  private worker: Worker | SharedWorker
  private port: Worker | MessagePort
  private requestId = 0
  private pending = new Map<number, {
    resolve: (data: any) => void,
    reject: (err: any) => void
  }>()
  private subjects = new Map<string, Subject<any>>()

  constructor(worker: Worker | SharedWorker) {

    this.worker = worker

    // 🔥 handle both cases
    if (worker instanceof SharedWorker || ('port' in worker)) {
      this.port = (worker as any).port || worker
      if ((this.port as any).start) (this.port as any).start()
    } else {
      this.port = worker as any
    }

    this.port.onmessage = (event: MessageEvent) => {

      const { id, eventName, eventPayload, success, result, error } = event.data

      if (DEBUG) console.log(`[Bridge] Received:`, event.data)

      if (id !== undefined) {
        const entry = this.pending.get(id)
        if (entry) {
          if (success) entry.resolve(result)
          else entry.reject(new Error(error))
          this.pending.delete(id)
        }
      }

      if (eventName === "worker.log") {
        const { type, args } = eventPayload
        const prefix = `[Worker]`
        if (type === "warn") console.warn(prefix, ...args)
        else if (type === "error") console.error(prefix, ...args)
        else console.log(prefix, ...args)
        return
      }

      if (eventName) {
        if (!this.subjects.has(eventName)) {
          this.subjects.set(eventName, new Subject())
        }
        this.subjects.get(eventName)!.next(eventPayload)
      }
    }
  }
  execute(command: string, payload: any): Promise<any> {

    const id = this.requestId++

    return new Promise((resolve, reject) => {

      this.pending.set(id, { resolve, reject })

      // ⏱ timeout
      const timeout = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id)
          reject(new Error("Worker timeout"))
        }
      }, 10000)

      if (DEBUG) console.log(`[Bridge] Sending:`, { id, command, payload })

      this.port.postMessage({
        id,
        command,
        payload
      })

    })

  }

  dispatch(command: string, payload: any) {

    return this.execute(command, payload)

  }

  events(eventName: string) {

    if (!this.subjects.has(eventName)) {
      this.subjects.set(eventName, new Subject())
    }

    return this.subjects.get(eventName)!.asObservable()

  }

}