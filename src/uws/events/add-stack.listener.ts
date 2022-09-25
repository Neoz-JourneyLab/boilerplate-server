import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../database/datasource'
import {ItemEntity} from '../../database/entity/item.entity'

listenersStore.on('update:stack', async (client: Client, data: { quantity: number, id: string }) => {
  const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({socket_id: client.socketId})
  //const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({nickname: 'Neoz'})

  if (!user) {
    throw new Error('user not found')
  }

  if(data.quantity <= 0){
    await dataSource.manager.createQueryBuilder().delete().from(ItemEntity).where({id: data.id}).execute()
    return
  }

  await dataSource.manager.createQueryBuilder().update(ItemEntity).set({
    quantity: data.quantity
  }).where({id: data.id}).execute()
})
