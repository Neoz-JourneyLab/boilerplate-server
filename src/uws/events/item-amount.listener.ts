import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../database/datasource'
import {ItemEntity} from '../../database/entity/item.entity'
import {ItemModelEntity} from '../../database/entity/item-model.entity'

listenersStore.on('item:amount', async (client: Client, data: { quantity: number, model: string, x: number, y: number }) => {
  const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({socket_id: client.socketId})
  //const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({nickname: 'Neoz'})

  if (!user) {
    throw new Error('user not found')
  }
  const model: ItemModelEntity | null = await dataSource.manager.getRepository(ItemModelEntity).findOneBy({id: data.model})
  if (!model) {
    throw new Error('model not found')
  }

  await dataSource.manager.createQueryBuilder().insert().into(ItemEntity).values({
    model: model,
    user: user,
    quantity: data.quantity,
    x: data.x,
    y: data.y
  }).execute()
})
