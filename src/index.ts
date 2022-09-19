import {DataSource} from 'typeorm'
import {GetUws} from './uws/uws'
import {UserEntity} from './database/entity/user.entity'
import {env} from "./env";
import {MessageEntity} from "./database/entity/message.entity";
import {GameEntity} from "./database/entity/game.entity";

export const dataSource = new DataSource({
  url: env.TYPEORM_URL,
  type: 'postgres',
  synchronize: true,
  entities: [UserEntity, MessageEntity, GameEntity],
  //logging: ['query']
})
dataSource.initialize().then(async () => {
  //getExpress()
  await GetUws()
  await dataSource.manager.createQueryBuilder().update(UserEntity).set({socket_id: null}).execute()
  await dataSource.manager.createQueryBuilder().delete().from(GameEntity).execute()
})
