import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('tariffs_box', table => {
		table.increments('id').primary()
		table.date('date').notNullable()
		table.string('warehouse_name').notNullable()
		table.string('geo_name').nullable()
		table.decimal('box_delivery_base', 10, 2).nullable()
		table.decimal('box_delivery_coef_expr', 10, 2).nullable()
		table.decimal('box_delivery_liter', 10, 2).nullable()
		table.string('box_delivery_marketplace_base').nullable()
		table.string('box_delivery_marketplace_coef_expr').nullable()
		table.string('box_delivery_marketplace_liter').nullable()
		table.decimal('box_storage_base', 10, 2).nullable()
		table.decimal('box_storage_coef_expr', 10, 2).nullable()
		table.decimal('box_storage_liter', 10, 2).nullable()
		table.timestamp('created_at').defaultTo(knex.fn.now())
		table.unique(['date', 'warehouse_name'])
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('tariffs_box')
}
