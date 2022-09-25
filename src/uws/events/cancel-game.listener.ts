import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {clientsStore} from '../clients-store'

import {UserEntity} from '../../database/entity/user.entity'
import {GameEntity} from '../../database/entity/game.entity'
import {dataSource} from '../../database/datasource'

listenersStore.on('cancel:game', async (client: Client, data: { id: string }) => {
  const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({socket_id: client.socketId})
  if (!user) {
    throw new Error('user not found')
  }
  await dataSource.manager.createQueryBuilder().delete().from(GameEntity).where({id: data.id}).execute()
  console.log('user', user.nickname, 'canceled game', data.id)
  clientsStore.broadcast('cancel:game', {id: data.id})
})
