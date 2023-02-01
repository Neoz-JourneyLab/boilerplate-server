import {bool, cleanEnv, num, str} from 'envalid'

interface EnvInterface {
  readonly TYPEORM_SCHEMA: string
  readonly TYPEORM_ENTITIES: string
  readonly TYPEORM_DRIVER: string
  readonly TYPEORM_SYNCHRONIZE: boolean

  readonly TYPEORM_MIGRATIONS_RUN: boolean
  readonly TYPEORM_MIGRATIONS: string
  readonly TYPEORM_URL: string
  readonly TYPEORM_MIGRATIONS_DIR: string
  readonly TYPEORM_MIGRATIONS_TABLE_NAME: string

  readonly TYPEORM_LOGGING: boolean
  readonly TYPEORM_LOGGING_QUERIES: boolean
  readonly TYPEORM_LOGGING_FAILED_QUERIES: boolean
  readonly TYPEORM_LOGGING_ONLY_FAILED_QUERIES: boolean

  readonly PORT: number
  readonly MESSAGE_CONSERVATION_DAYS: number
  readonly MESSAGE_READ_CONSERVATION_DAYS: number
}

export const env: Readonly<EnvInterface> = cleanEnv(process.env, {
  TYPEORM_SCHEMA: str({default: 'public'})
  , TYPEORM_ENTITIES: str({default: 'src/database/entity/**/*.entity.ts'})
  , TYPEORM_DRIVER: str({default: 'postgres'})
  , TYPEORM_URL: str({default: 'postgres://postgres:root@localhost:5432/crypto_chat'})
  , TYPEORM_SYNCHRONIZE: bool({default: true})

  , TYPEORM_MIGRATIONS_RUN: bool({default: false})
  , TYPEORM_MIGRATIONS: str({default: 'src/database/migrations/*.ts'})
  , TYPEORM_MIGRATIONS_DIR: str({default: 'src/database/migrations'})
  , TYPEORM_MIGRATIONS_TABLE_NAME: str({default: 'database_migrations'})

  , TYPEORM_LOGGING: bool({default: false})
  , TYPEORM_LOGGING_QUERIES: bool({default: false})
  , TYPEORM_LOGGING_FAILED_QUERIES: bool({default: false})
  , TYPEORM_LOGGING_ONLY_FAILED_QUERIES: bool({default: false})

  , PORT: num({default: 9997})
  , MESSAGE_CONSERVATION_DAYS: num({default: 30})
  , MESSAGE_READ_CONSERVATION_DAYS: num({default: 10})
})
