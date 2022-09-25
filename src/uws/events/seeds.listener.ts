import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {ItemModelEntity} from '../../database/entity/item-model.entity'
import {ItemEntity} from '../../database/entity/item.entity'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../database/datasource'

class items {
  modelId!: string
  id!: string
  quantity!: number
  x!: number
  y!: number
}

listenersStore.on('seeds', async (client: Client) => {
  try {
    const itemsModels: ItemModelEntity[] = await dataSource.manager.getRepository(ItemModelEntity).find()
    client.emit('seeds:items', itemsModels)
    const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({socket_id: client.socketId})
    //const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({nickname: 'Neoz'})

    if (!user) {
      throw new Error(`user not found for socket ${client.socketId}`)
    }
    const userItems: ItemEntity[] = await dataSource.manager.getRepository(ItemEntity).createQueryBuilder('items')
      .innerJoin('items.user', 'user')
      .innerJoinAndSelect('items.model', 'model')
      .where('user.id = :id', {id: user.id})
      .select(['items.id', 'items.quantity', 'model.id', 'items.x', 'items.y'])
      .getMany()
    const itemsStruct: items[] = []
    for(const i of userItems){
      itemsStruct.push({modelId: i.model.id, quantity: i.quantity, id: i.id, x: i.x, y: i.y})
    }
    client.emit('player:items', itemsStruct)
  } catch (err) {
    client.emitError('seeds', err as string)
  }
})
