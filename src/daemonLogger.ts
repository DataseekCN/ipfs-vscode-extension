import { ChildProcess } from 'child_process'
import { EventEmitter } from 'events'

export class DaemonLogger extends EventEmitter {
  private _logs: string = ''
  private _daemon: ChildProcess

  get logs() {
    return this._logs
  }

  constructor(daemon: ChildProcess) {
    super()

    this._daemon = daemon
    this._daemon.stdout?.on('data', (data) => {
      this.emit('daemon-log', data)
    })
    this.on('daemon-log', (data: string) => {
      this._logs += data
      this.emit('data', data)
    })
  }
}
