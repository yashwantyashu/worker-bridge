import { APP_INITIALIZER, Provider } from '@angular/core'
import { bootstrapWorker } from './bootstrap'

export interface WorkerBridgeConfig {
  name?: string
  instance: Worker | SharedWorker
  modules?: any[]
}

export function provideWorkerBridge(config: WorkerBridgeConfig): Provider {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: () => {
      return () => bootstrapWorker({
        name: config.name,
        worker: config.instance,
        modules: config.modules
      })
    }
  }
}
