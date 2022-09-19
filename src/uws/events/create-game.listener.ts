import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import {clientsStore} from "../clients-store"
import {dataSource} from "../../index";
import {GameEntity} from "../../database/entity/game.entity";
import {UserEntity} from "../../database/entity/user.entity";
import {v4} from "uuid";
import {UpdateNickname} from "./nickname.listener";

listenersStore.on('create:game', async (client: Client, data: { name: string, nickname: string, level: string }) => {
  const user: UserEntity = await UpdateNickname(client, data.nickname)

  const id: string = v4()
  await dataSource.manager.createQueryBuilder().delete().from(GameEntity).where({user: user}).execute()
  await dataSource.manager.createQueryBuilder().insert().into(GameEntity).values({
    name: data.name,
    user: user,
    level: data.level,
    id: id
  }).execute()
  clientsStore.broadcast("new:game:available", {name: data.name, nickname: data.nickname, id: id, level: data.level})
  console.log('user', user.nickname, 'created game', data.name)
})
