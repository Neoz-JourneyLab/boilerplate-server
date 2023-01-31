import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import {UserEntity} from "../../database/entity/user.entity";
import {dataSource} from "../../index";
import {MessageEntity} from "../../database/entity/message.entity";
import {getBothUsers} from './set_distributed.listener'

listenersStore.on('request:messages', async (client: Client, data: { userNickname: string, lastId: string }) => {
    try {
      const users = await getBothUsers(client.socketId, data.userNickname, false)
      const user: UserEntity = users.user
      const to: UserEntity = users.user2

      let date: Date = new Date()
      if (data.lastId != 'null') {
        const lastMessage: MessageEntity | null = await dataSource.manager.getRepository(MessageEntity).findOneBy({id: data.lastId})
        if (!lastMessage) throw new Error('dernier message introuvable')
        date = lastMessage.send_at
      }

      const limit: number = 10

      const messages: MessageEntity[] = await dataSource.manager.getRepository(MessageEntity).createQueryBuilder('message')
        .innerJoinAndSelect('message.from', 'from')
        .innerJoinAndSelect('message.to', 'to')
        .where('((from.id = :id AND to.id = :ido) OR (from.id = :ido AND to.id = :id)) AND send_at < :date', {id: user.id, ido: to.id, date: date})
        .orderBy('message.send_at', 'DESC')
        .limit(limit)
        .getMany()

      if(messages.length < limit){
        client.emit('no:more:messages', {nickname: data.userNickname})
      }

      date.setMilliseconds(0)
      for (const m of messages) {
        client.emit('new:message', {
          from: m.from.id,
          to: m.to.id,
          id: m.id,
          content: m.cipher,
          send_at: m.send_at,
          distributed: m.distributed_at != null,
        })
      }
    } catch (err) {
      client.emitError('request:messages', err as string)
    }
  }
)
