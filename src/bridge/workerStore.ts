import { Observable } from "rxjs"
import { WorkerContext } from "../context/workerContext"

export function workerStore<T = any>(key: string, name: string = "default"): Observable<T> {

    return new Observable<T>((subscriber) => {

        const bridge = WorkerContext.getBridge(name)

        const sub = bridge
            .events(`state:${key}`)
            .subscribe((value: T) => {
                subscriber.next(value)
            })

        return () => sub.unsubscribe()

    })

}