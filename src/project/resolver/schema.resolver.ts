import { Resolver } from '@nestjs/graphql';
import { Schema } from '../entities/schema.entity';

@Resolver(() => Schema)
export class SchemaResolver {}
