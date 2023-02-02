import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import {UserEntity} from "../../database/entity/user.entity";
import {dataSource} from "../../index";
import {MessageEntity} from "../../database/entity/message.entity";
import {getBothUsers} from './set_distributed.listener'

listenersStore.on('request:messages', async (client: Client, data: { userId: string, userNickname: string, lastId: string, limit: number }) => {
    try {
      const users = await getBothUsers(client.socketId, data.userId == '' ? data.userNickname : data.userId, data.userId != '')
      console.log('requested, ', data.limit, ' message before', data.lastId)
      const user: UserEntity = users.user
      const to: UserEntity = users.user2

      let date: Date = new Date()
      let idm: string = ''
      if (data.lastId != 'null') {
        const lastMessage: MessageEntity | null = await dataSource.manager.getRepository(MessageEntity).findOneBy({id: data.lastId})
        if (!lastMessage) throw new Error('dernier message introuvable')
        date = lastMessage.send_at
        idm = lastMessage.id
      }

      const limit: number = data.limit ?? 10

      const messages: MessageEntity[] = await dataSource.manager.getRepository(MessageEntity).createQueryBuilder('message')
        .innerJoinAndSelect('message.from', 'from')
        .innerJoinAndSelect('message.to', 'to')
        .where('((from.id = :id AND to.id = :ido) OR (from.id = :ido AND to.id = :id)) ' +
          'AND send_at <= :date AND message.id != :idm', {
          id: user.id,
          ido: to.id,
          date: date,
          idm: idm
        })
        .orderBy('message.send_at', 'DESC')
        .limit(limit)
        .getMany()

      if (messages.length < limit) {
        client.emit('no:more:messages', {id: to.id})
      }

      let i = 1;
      for (const m of messages) {
        client.emit('new:message', {
          from: m.from.id,
          to: m.to.id,
          id: m.id,
          cipher: m.cipher,
          sender_rsa_info: m.sender_rsa_info,
          ratchet_infos: m.ratchet_infos,
          root_id: m.root_id,
          ratchet_index: m.ratchet_index,
          send_at: m.send_at,
          distributed: m.distributed_at != null,
          pending_batch: `${i++}/${messages.length}`
        })
      }
    } catch (err) {
      client.emitError('request:messages', err as string)
    }
  }
)
