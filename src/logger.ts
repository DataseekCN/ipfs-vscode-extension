import EventEmitter from 'events'
import { LogType, Subscriber, Unsubscriber } from './types/logger'

class Logger extends EventEmitter {
  private _logs: Record<LogType, string> = { ipfs: '', daemon: '' }

  subscribe(type: LogType, subscriber: Subscriber): Unsubscriber {
    const eventName = `${type}-log`
    subscriber(this._logs[type])
    this.on(eventName, subscriber)
    return () => this.removeListener(eventName, subscriber)
  }

  log(type: LogType, content: string) {
    content = `[${new Date().toLocaleString()}] ${content}\n`
    this._logs[type] += content
    this.emit(`${type}-log`, content)
  }
}

const logger = new Logger()

export default logger
