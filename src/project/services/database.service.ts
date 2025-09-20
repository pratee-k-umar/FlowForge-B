import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
// import { MongoClient } from 'mongodb';
import { ProjectDetails } from '../entities/project-detail.entity';
import { Schema } from '../entities/schema.entity';
import { Fields } from '../entities/fields.entity';
import { InjectRepository } from '@nestjs/typeorm';
import mongoose, {
  Connection,
  Schema as MongooseSchema,
  Model,
} from 'mongoose';
import { ProjectAuth } from '../entities/project-auth.entity';

@Injectable()
export class DatabaseService {
  private sqlDataSources = new Map<string, DataSource>();
  private mongoClients = new Map<string, Connection>();
  private projectAuthMongooseSchema: MongooseSchema;
  constructor(
    @InjectRepository(Schema)
    private readonly tableRepo: Repository<Schema>,
    @InjectRepository(Fields)
    private readonly FieldRepo: Repository<Fields>,
  ) {}

  /** Get or create a connection for this projectId */
  private async getConnection(
    projectId: string,
    details: ProjectDetails,
    dbName?: string,
    entities?: any[],
  ) {
    if (!details.connectionUri) throw new Error('No database configured');

    if (details.dbType === 'mongodb') {
      if (!this.mongoClients.has(projectId)) {
        // const client = new MongoClient(details.connectionUri);
        // await client.connect();
        // this.mongoClients.set(projectId, client);
        const connection = mongoose.createConnection(details.connectionUri, {
          dbName: dbName,
        });
        this.mongoClients.set(projectId, connection);
      }
      return this.mongoClients.get(projectId);
    }
    if (!this.sqlDataSources.has(projectId)) {
      const ds = new DataSource({
        type: details.dbType as any,
        url: details.connectionUri,
        synchronize: false,
        entities: entities,
      });
      await ds.initialize();
      this.sqlDataSources.set(projectId, ds);
    }
    return this.sqlDataSources.get(projectId)!;
  }

  /** Loop through all TableSchemas and ColumnSchemas and create tables/collections */
  async provisionSchema(details: ProjectDetails, dbName?: string) {
    const conn = await this.getConnection(details.id, details, dbName);

    // load schemas and their columns
    const tables = await this.tableRepo.find({
      where: { projectDetail: { id: details.id } },
      relations: ['fields'],
    });

    for (const tbl of tables) {
      const name = tbl.name;
      const cols = tbl.fields;

      if (conn instanceof DataSource) {
        const qr = conn.createQueryRunner();
        // ensure table exists
        await qr.query(
          `CREATE TABLE IF NOT EXISTS "${name}" (id uuid PRIMARY KEY)`,
        );
        // add or alter columns
        for (const f of cols) {
          await qr.query(
            `ALTER TABLE "${name}" ADD COLUMN IF NOT EXISTS "${f.name}" ${f.type}${
              f.isRequired ? ' NOT NULL' : ''
            };`,
          );
          if (f.referencesSchemaId) {
            // fetch referenced table to get its name
            const refTable = await this.tableRepo.findOne({
              where: { id: f.referencesSchemaId },
            });
            if (!refTable)
              throw new NotFoundException('Referenced table schema not found');
            await qr.query(
              `ALTER TABLE "${name}" ADD CONSTRAINT fk_${name}_${f.name} FOREIGN KEY ("${f.name}") REFERENCES "${refTable.name}"("${f.referencesField}") ON DELETE CASCADE;`,
            );
          }
        }
        await qr.release();
      } else {
        const db = conn;
        const collections = await db.listCollections();
        const exists = collections.find((col: any) => col.name === name);
        if (!exists) {
          await db.createCollection(name);
        }
      }
    }
  }

  /** Drop a table/collection from a project's database */
  async dropSchemaTable(
    details: ProjectDetails,
    tableName: string,
    dbName: string,
  ) {
    const conn = await this.getConnection(details.id, details, dbName);

    if (conn instanceof DataSource) {
      const qr = conn.createQueryRunner();
      await qr.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
      await qr.release();
    } else {
      const db = conn;
      try {
        await db.collection(tableName).drop();
      } catch (err: any) {
        if (err.codeName !== 'NamespaceNotFound') throw err;
      }
    }
  }

  /**
   * Dynamically gets a reopsitory for the projectAuth entity from the project's database
   * Also ensures the ProjectAuth table is syncronized
   */
  async getProjectAuthRepository(
    projectDetails: ProjectDetails,
  ): Promise<Repository<ProjectAuth>> {
    if (!projectDetails)
      throw new BadRequestException('No databse configured for the project..!');

    const conn = await this.getConnection(
      projectDetails.id,
      projectDetails,
      undefined,
      [ProjectAuth],
    );

    if (conn instanceof DataSource) {
      await conn.synchronize(false);
      return conn.getRepository(ProjectAuth);
    } else if (conn instanceof mongoose.Connection) {
      let projectAuthModel = Model<ProjectAuth>;
      try {
        projectAuthModel = conn.model<ProjectAuth>('ProjectAuth');
      } catch (error) {
        projectAuthModel = conn.model<ProjectAuth>(
          'ProjectAuth',
          this.projectAuthMongooseSchema,
        );
      }
      return projectAuthModel as unknown as Repository<ProjectAuth>;
    } else throw new BadRequestException('Unsupported database type');
  }

  /**
   * Provision the ProjectAuth schema (table/collection) in the developer's database
   */
  async provisionProjectAuthSchema(
    projectDetails: ProjectDetails,
  ): Promise<void> {
    await this.getProjectAuthRepository(projectDetails);
  }
}
