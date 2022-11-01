import { ChildProcess } from 'child_process'
import { EventEmitter } from 'events'

export class DaemonLogger extends EventEmitter {
  private _logs: string = ''
  private daemon?: ChildProcess

  get logs() {
    return this._logs
  }

  constructor(daemon?: ChildProcess) {
    super()

    this.daemon = daemon

    if (this.daemon) {
      this.daemon.stdout?.on('data', (data) => {
        this.emit('daemon-log', data)
      })
      this.on('daemon-log', (data: string) => {
        this._logs += data
        this.emit('data', data)
      })
    } else {
      this._logs = 'Logs will be available once you close off all IPFS applications and processes.'
    }
  }
}
