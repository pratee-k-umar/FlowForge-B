import { InputType, Field, registerEnumType } from '@nestjs/graphql';

export enum DbType {
  MONGO = 'mongo',
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
}

registerEnumType(DbType, { name: 'DbType' });

@InputType()
export class DatabaseConfigInput {
  @Field(() => DbType)
  dbType: DbType;

  @Field(() => String, {
    description: 'Full connection URI to your cloud database',
  })
  connectionUri: string;
}
