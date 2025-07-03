import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MongoClient } from 'mongodb';
import { ProjectDetails } from '../entities/project-detail.entity';
import { Schema } from '../entities/schema.entity';
import { Fields } from '../entities/fields.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService {
  private sqlDataSources = new Map<string, DataSource>();
  private mongoClients = new Map<string, MongoClient>();

  constructor(
    @InjectRepository(Schema)
    private readonly tableRepo: Repository<Schema>,
    @InjectRepository(Fields)
    private readonly FieldRepo: Repository<Fields>,
  ) {}

  /** Get or create a connection for this projectId */
  private async getConnection(projectId: string, details: ProjectDetails) {
    if (!details.connectionUri) throw new Error('No database configured');

    if (details.dbType === 'mongo') {
      if (!this.mongoClients.has(projectId)) {
        const client = new MongoClient(details.connectionUri);
        await client.connect();
        this.mongoClients.set(projectId, client);
      }
      return this.mongoClients.get(projectId).db();
    }
    if (!this.sqlDataSources.has(projectId)) {
      const ds = new DataSource({
        type: details.dbType as any,
        url: details.connectionUri,
        synchronize: false,
      });
      await ds.initialize();
      this.sqlDataSources.set(projectId, ds);
    }
    return this.sqlDataSources.get(projectId)!;
  }

  /** Loop through all TableSchemas and ColumnSchemas and create tables/collections */
  async provisionSchema(details: ProjectDetails) {
    const conn = await this.getConnection(details.id, details);

    // load schemas and their columns
    const tables = await this.tableRepo.find({
      where: { projectDetail: { id: details.id } },
      relations: ['columns'],
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
              `ALTER TABLE "${name}"
               ADD CONSTRAINT fk_${name}_${f.name}
               FOREIGN KEY ("${f.name}")
               REFERENCES "${refTable.name}"("${f.referencesField}")
               ON DELETE CASCADE;`,
            );
          }
        }
        await qr.release();
      } else {
        const db = conn;
        const exists = await db.listCollections({ name }).toArray();
        if (!exists.length) {
          await db.createCollection(name);
        }
      }
    }
  }

  /** Drop a table/collection from a project's database */
  async dropSchemaTable(details: ProjectDetails, tableName: string) {
    const conn = await this.getConnection(details.id, details);

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
}
