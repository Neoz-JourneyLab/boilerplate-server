import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import {dataSource} from "../../index";
import {GameEntity} from "../../database/entity/game.entity";

listenersStore.on('request:games', async (client: Client) => {
  const games: GameEntity[] = await dataSource.manager.getRepository(GameEntity).find({relations: {user: true}})
  for(const game of games) {
    client.emit("new:game:available", {name: game.name, nickname: game.user.nickname, id: game.id, level: game.level})
  }
})
