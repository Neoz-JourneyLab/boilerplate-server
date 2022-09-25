import {BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {GameEntity} from './game.entity'
import {ItemEntity} from './item.entity'

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {name: 'id'})
  public id!: string

  @Column({name: 'nickname', nullable: false, unique: true, type: 'varchar'})
  public nickname!: string

  @Column({name: 'socket_id', nullable: true, unique: true, type: 'varchar'})
  public socket_id!: string | null

  @OneToOne(() => GameEntity, (g) => g.user)
  game!: GameEntity | null

  @OneToMany(() => ItemEntity, (i) => i.user)
  items!: ItemEntity[]
}
