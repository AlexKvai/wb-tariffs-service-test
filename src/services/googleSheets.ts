import { google } from 'googleapis'
import knex from '../db/knex'

const SERVICE_ACCOUNT_FILE = '/app/config/google-service-account.json'

const SHEET_NAME = 'stocks_coefs'

interface TariffRow {
	warehouse_name: string
	geo_name: string | null
	box_delivery_base: number | null
	box_delivery_coef_expr: number | null
	box_delivery_liter: number | null
	box_storage_base: number | null
	box_storage_coef_expr: number | null
	box_storage_liter: number | null
	date: string
}

export async function updateSheets(sheetIds: string[]) {
	// Авторизация через service account
	const auth = new google.auth.GoogleAuth({
		keyFile: SERVICE_ACCOUNT_FILE,
		scopes: ['https://www.googleapis.com/auth/spreadsheets'],
	})
	const sheets = google.sheets({ version: 'v4', auth })

	// Берём данные из базы
	const rows: TariffRow[] = await knex('tariffs_box')
		.select('*')
		.orderBy('box_delivery_coef_expr', 'asc')

	if (!rows.length) {
		console.warn('[Sheets] No data to update')
		return
	}

	// Преобразуем в массив массивов для Google Sheets
	const values = [
		[
			'Date',
			'Warehouse',
			'Geo',
			'Box Delivery Base',
			'Box Delivery Coef',
			'Box Delivery Liter',
			'Box Storage Base',
			'Box Storage Coef',
			'Box Storage Liter',
		],
		...rows.map(r => [
			r.date,
			r.warehouse_name,
			r.geo_name || '',
			r.box_delivery_base ?? '',
			r.box_delivery_coef_expr ?? '',
			r.box_delivery_liter ?? '',
			r.box_storage_base ?? '',
			r.box_storage_coef_expr ?? '',
			r.box_storage_liter ?? '',
		]),
	]

	// Обновляем каждую таблицу
	for (const sheetId of sheetIds) {
		try {
			// Получаем список листов
			const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
			const sheetExists = res.data.sheets?.some(
				s => s.properties?.title === SHEET_NAME
			)

			// Если листа нет — создаём
			if (!sheetExists) {
				await sheets.spreadsheets.batchUpdate({
					spreadsheetId: sheetId,
					requestBody: {
						requests: [
							{
								addSheet: { properties: { title: SHEET_NAME } },
							},
						],
					},
				})
				console.log(`[Sheets] Created sheet '${SHEET_NAME}' in ${sheetId}`)
			}

			// Записываем данные в лист
			await sheets.spreadsheets.values.update({
				spreadsheetId: sheetId,
				range: `${SHEET_NAME}!A1`,
				valueInputOption: 'RAW',
				requestBody: { values },
			})

			console.log(`[Sheets] Updated sheet ${sheetId} with ${rows.length} rows`)
		} catch (err) {
			console.error(`[Sheets] Error updating sheet ${sheetId}:`, err)
		}
	}
}
