# ngx-worker-bridge

A lightweight, zero-boilerplate reactive bridge for **Angular** and **React** that makes Web Workers (Dedicated and Shared) as simple as calling a regular method.

[![npm version](https://img.shields.io/npm/v/ngx-worker-bridge.svg)](https://www.npmjs.com/package/ngx-worker-bridge)
[![license](https://img.shields.io/npm/l/ngx-worker-bridge.svg)](./LICENSE)

## Why?

Web Workers have a verbose API (`postMessage`, `onmessage`, manual serialization). This library removes all of that. Just decorate a method with `@RunInWorker` — the rest is handled for you.

## Installation

**Angular** (RxJS is already included in Angular projects):
```bash
npm i ngx-worker-bridge
```

**React** (RxJS must be installed separately since React doesn't include it):
```bash
npm i ngx-worker-bridge rxjs
```

> **React only**: Add these to your `tsconfig.app.json` for decorator support:
> ```json
> { "experimentalDecorators": true, "useDefineForClassFields": false }
> ```

---

## Core Concept

| Thread | Your Code |
|---|---|
| **Worker thread** | A plain TypeScript class (`Module`) with your business logic |
| **Main thread** | A service/component that calls methods as if they're local |

The library handles the `postMessage` bridge between them invisibly.

---

## Angular Quick Start

### 1. Worker file (`app.worker.ts`)
```typescript
import { startWorker } from 'ngx-worker-bridge';
import { DataModule } from './data.module';

startWorker([DataModule]);
```

### 2. Bootstrap (`main.ts`)
```typescript
import { provideWorkerBridge } from 'ngx-worker-bridge/angular';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkerBridge({
      instance: new Worker(new URL('./app.worker', import.meta.url), { type: 'module' }),
      modules: [DataModule]
    }),
    // Optional: add a SharedWorker for multi-tab state
    provideWorkerBridge({
      name: 'shared',
      instance: new SharedWorker(new URL('./app.worker', import.meta.url), { name: 'shared', type: 'module' }),
      modules: [DataModule]
    })
  ]
});
```

### 3. Service
```typescript
import { Injectable } from '@angular/core';
import { RunInWorker, workerStore } from 'ngx-worker-bridge';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Reactive state — updates automatically when the worker calls setState()
  count$ = workerStore<number>('counter', 'shared');

  // This runs in the worker — UI thread is never blocked
  @RunInWorker({ bridge: 'shared', namespace: 'data' })
  processData(payload: any): Promise<any> { return null as any; }
}
```

---

## React Quick Start

### 1. Worker file (`app.worker.ts`)
```typescript
import { startWorker } from 'ngx-worker-bridge';
import { DataModule } from './data.module';

startWorker([DataModule]);
```

### 2. Bootstrap (`App.tsx` or `main.tsx`)
```typescript
import { bootstrapWorker } from 'ngx-worker-bridge';
import { DataModule } from './data.module';

bootstrapWorker({
  worker: new SharedWorker(new URL('./app.worker', import.meta.url), { name: 'shared', type: 'module' }),
  name: 'shared',
  modules: [DataModule]
});
```

### 3. Component
```typescript
import { useWorkerStore } from 'ngx-worker-bridge/react';
import { RunInWorker } from 'ngx-worker-bridge';

class DataService {
  @RunInWorker({ bridge: 'shared', namespace: 'data' })
  processData(payload: any): Promise<any> { return null as any; }
}

const service = new DataService();

function App() {
  const count = useWorkerStore<number>('counter', 'shared');
  return <button onClick={() => service.processData({})}>Count: {count}</button>;
}
```

---

## Worker Module

Your background logic lives in a plain TypeScript class. Use `setState` to push reactive updates to all connected tabs.

```typescript
import { setState } from 'ngx-worker-bridge';

export class DataModule {
  private count = 0;

  // Namespace matches the class name: "DataModule" → "data"
  increment() {
    this.count++;
    setState('counter', this.count); // broadcasts to all tabs
    return this.count;
  }
}
```

---

## Best Use Cases

- **Multi-Tab State Sync** — Use a `SharedWorker` to keep counters, notifications, or live data in sync across all open tabs without any server involvement.
- **CPU Offloading** — Move heavy computation (large JSON processing, sorting, math) off the UI thread so your app stays interactive.
- **Shared Connections** — Maintain a single WebSocket or polling interval in a SharedWorker and broadcast to all connected tabs.

---

## Debugging

All `console.log`, `console.warn`, and `console.error` calls made inside your worker modules are automatically forwarded to the main browser console, prefixed with `[Worker]`. No setup required.

---

## Demo

[Demo Repository (Angular)](https://github.com/yashwantyashu/worker-demo-app)
