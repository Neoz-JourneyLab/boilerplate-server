import {BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {UserEntity} from './user.entity'

@Entity('games')
export class GameEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {name: 'id'})
  public id!: string

  @Column({name: 'name', nullable: false, unique: false, type: 'varchar'})
  public name!: string

  @Column({name: 'level', nullable: false, unique: false, type: 'varchar'})
  public level!: string

  @OneToOne (() => UserEntity, (u) => u.game, {nullable: false})
  @JoinColumn()
  user!: UserEntity
}
