import {listenersStore} from './listeners-store'
import {Client} from './client'

interface trunk {
  index: number
  trunk: string
}

export class PartialAttachment {
  private store: Map<string, trunk[]> = new Map<string, trunk[]>()

  public add(trunk: string, alias: string, index: number) {
    if(this.store.has(alias) && index == 0) this.store.delete(alias)

    if(!this.store.has(alias)) {
      this.store.set(alias, [{trunk, index}])
      return
    }
    this.store.get(alias)?.push({trunk, index})
  }

  public async reconstruct(alias: string, client: Client){
    if(!this.store.has(alias)) return

    let attachment: string = ''
    this.store.get(alias)?.sort(t => t.index).forEach(value => {
      attachment += value.trunk
    })
    await listenersStore.exec('send:attachment', client, {aes_attachment: alias, message: JSON.parse(attachment)})
    this.store.delete(alias)
  }
}

export const partialAttachmentStore = new PartialAttachment()
