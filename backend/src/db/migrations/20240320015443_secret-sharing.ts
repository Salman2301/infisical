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
      t.string("passpharse");
      t.string("pathSlug");
      t.datetime("expireAt").notNullable();
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
