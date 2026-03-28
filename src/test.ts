import { bootstrapWorker } from "./bootstrap"
import { EventModule } from "./worker/modules/eventModule"
import { EventService } from "./eventService"

async function run() {

    await bootstrapWorker({
        worker: new Worker(new URL("./worker/appWorker.ts", import.meta.url)),
        modules: [EventModule]
    })

    const eventService = new EventService()

    // subscribe to state
    eventService.events$.subscribe((data: any) => {
        console.log("Events updated:", data)
    })

    // trigger fetch
    await eventService.fetchEvents()

}

run()