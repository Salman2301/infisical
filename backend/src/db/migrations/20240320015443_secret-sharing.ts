import { Knex } from "knex";

import { TableName } from "../schemas";
import {
  createOnUpdateTrigger,
  createUpdateAtTriggerFunction,
  dropOnUpdateTrigger,
  dropUpdatedAtTriggerFunction
} from "../utils";

export async function up(knex: Knex): Promise<void> {
  const isTablePresent = await knex.schema.hasTable(TableName.SecretSharing);
  if (!isTablePresent) {
    await knex.schema.createTable(TableName.SecretSharing, (t) => {
      t.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
      t.timestamps(true, true, true);
      t.string("secretContent").notNullable();
      t.boolean("read").defaultTo(false);
      t.boolean("readOnlyOnce").defaultTo(false);
      t.string("pathSlug").unique().notNullable();
      t.integer("expireAtValue").notNullable();
      t.string("expireAtUnit").notNullable();
      t.boolean("isPasswordProtected").defaultTo(false);
      t.datetime("expireAtDate").notNullable();
      t.datetime("lastReadAt");
      t.string("iv").notNullable();
      t.string("projectId").notNullable();
      t.foreign("projectId").references("id").inTable(TableName.Project).onDelete("CASCADE");
    });
  }
  await createUpdateAtTriggerFunction(knex);
  await createOnUpdateTrigger(knex, TableName.SecretSharing);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TableName.SecretSharing);
  await dropOnUpdateTrigger(knex, TableName.SecretSharing);
  await dropUpdatedAtTriggerFunction(knex);
}
