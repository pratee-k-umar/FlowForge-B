import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MongoClient } from 'mongodb';
import { ProjectService } from '../project.service';
import { ResourceService } from './resource.service';

@Injectable()
export class SchemaService {
  private sqlDataSources = new Map<string, DataSource>();
  private mongoClients = new Map<string, MongoClient>();

  constructor(
    @Inject(forwardRef(() => ResourceService))
    private readonly ps: ProjectService,
    private readonly rs: ResourceService,
  ) {}

  /** Get or create a connection for this projectId */
  private async getConnection(projectId: string) {
    const details = (await this.ps.findByIdWithDetails(projectId)).details;
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
        type: details.dbType,
        url: details.connectionUri,
        synchronize: false,
      });
      await ds.initialize();
      this.sqlDataSources.set(projectId, ds);
    }
    return this.sqlDataSources.get(projectId);
  }

  /** Looping through all Resources and creating tables/collections */
  async provisionSchema(projectId: string) {
    const conn = await this.getConnection(projectId);
    const resources = await this.rs.listResources(projectId);

    for (const r of resources) {
      const name = r.name;
      const fields = r.fields;

      if (conn instanceof DataSource) {
        const qr = conn.createQueryRunner();
        const cols = fields
          .map(
            (f) =>
              `"${f.name}" ${this.mapToSqlType(f.type)}${f.required ? ' NOT NULL' : ''}`,
          )
          .join(', ');
        await qr.query(
          `CREATE TABLE IF NOT EXISTS "${name}" (id uuid PRIMARY KEY, ${cols})`,
        );
        await qr.release();
      } else {
        const db = conn;
        const exists = await db.listCollections({ name }).toArray();
        if (!exists.length) await db.createCollection(name);
      }
    }
  }

  /** Mapping FieldDef.type to an SQL column type */
  private mapToSqlType(type: string): string {
    switch (type) {
      case 'number':
        return 'integer';
      case 'string':
        return 'text';
      case 'boolean':
        return 'boolean';
      case 'date':
        return 'timestamp';
      default:
        return 'text';
    }
  }
}
