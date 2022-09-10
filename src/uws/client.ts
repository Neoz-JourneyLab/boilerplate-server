import {clientsStore} from './clients-store'
import * as uws from 'uWebSockets.js'
import {v4} from 'uuid'
import chalk from "chalk";

export class Client {

  public readonly socketId: string
  public readonly ip: string

  constructor(readonly client: uws.WebSocket) {
    this.socketId = v4()
    client.id = this.socketId
    this.ip = client.clientIp || Buffer.from(client.getRemoteAddress()).join('.')
    clientsStore.set(this.socketId, this)
  }

  public emitError(code: string, message: string): boolean {
    console.log(chalk.red(code, ' ', message))
    return this.emit('err', {code: code, message: message.toString()})
  }

  public emit(eventName: string, payload?: object | string): boolean {
    if(!clientsStore.getBySocketId(this.socketId)) {
      console.warn(`Trying to send ${eventName} event to ${this.socketId} while not registered into clients store!`)
      return false
    }

    try {
      const p: string = typeof payload === 'string' ? payload : JSON.stringify(payload)
      const data: object = {
        ev: eventName,
        id: this.socketId,
        data: p,
      }
      return this.client.send(JSON.stringify(data))
    } catch (e) {
      console.error(e)
      return false
    }
  }

  public async kick(reason: string): Promise<void> {
    try {
      if(this.emit('kick', {reason: reason})) {
        this.client.close()
        clientsStore.delete(this.socketId)
      }
    } catch (e) {
      console.warn(e)
    } finally {
      console.warn(`client ${this.socketId} kicked from server! reason: ${reason}`)
    }
  }
}
