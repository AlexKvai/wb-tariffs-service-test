import cron from 'node-cron'
import { fetchTariffsBox } from '../jobs/fetchTariffsBox'
import { updateSheets } from './googleSheets'

export function startScheduler() {
	const sheetIds = process.env.GOOGLE_SHEETS_IDS?.split(',') || []

	cron.schedule('21 * * * *', async () => {
		console.log('Running hourly WB tariffs update...')
		await fetchTariffsBox()
		await updateSheets(sheetIds)
	})

	console.log('Scheduler started (hourly)')
}
