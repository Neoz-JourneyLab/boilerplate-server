import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm'

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid', {name: 'id'})
  public id!: string

  @Column({name: 'content', nullable: false, unique: false, type: 'varchar'})
  public content!: string
}
