import {env} from '../env'
import {UserEntity} from './entity/user.entity'
import {MessageEntity} from './entity/message.entity'
import {ItemEntity} from './entity/item.entity'
import {GameEntity} from './entity/game.entity'
import {ItemModelEntity} from './entity/item-model.entity'
import {DataSource} from 'typeorm'

export const dataSource = new DataSource({
  url: env.TYPEORM_URL,
  type: 'postgres',
  synchronize: true,
  entities: [UserEntity, MessageEntity, GameEntity, ItemModelEntity, ItemEntity],
  //logging: ['query']
})