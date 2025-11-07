import dotenv from 'dotenv'
dotenv.config()

import knex from './db/knex'
import { startScheduler } from './services/schedule'

async function main() {
	try {
		await knex.raw('select 1+1 as result')
		console.log('✅ DB connected')
		startScheduler()
	} catch (e) {
		console.error('❌ DB connection failed', e)
		process.exit(1)
	}
}

main()
