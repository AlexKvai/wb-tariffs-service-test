import axios from 'axios'
import knex from '../db/knex'
import { TariffBox } from '../types/TariffBox'

const WB_URL = 'https://common-api.wildberries.ru/api/v1/tariffs/box'

export async function fetchTariffsBox() {
	const today = new Date().toISOString().slice(0, 10)
	console.log(`[WB] Fetching tariffs for ${today}`)

	const { data } = await axios.get(WB_URL, {
		headers: { Authorization: `Bearer ${process.env.WB_API_TOKEN}` },
		params: { date: today }, 
	})

	const list: TariffBox[] = data?.response?.data?.warehouseList || []

	if (!list.length) {
		console.warn(`[WB] No tariffs returned for ${today}`)
		return
	}

	for (const item of list) {
		await knex('tariffs_box')
			.insert({
				date: today,
				warehouse_name: item.warehouseName,
				geo_name: item.geoName || null,
				box_delivery_base:
					parseFloat(item.boxDeliveryBase.replace(',', '.')) || null,
				box_delivery_coef_expr:
					parseFloat(item.boxDeliveryCoefExpr.replace(',', '.')) || null,
				box_delivery_liter:
					parseFloat(item.boxDeliveryLiter.replace(',', '.')) || null,
				box_delivery_marketplace_base: item.boxDeliveryMarketplaceBase,
				box_delivery_marketplace_coef_expr: item.boxDeliveryMarketplaceCoefExpr,
				box_delivery_marketplace_liter: item.boxDeliveryMarketplaceLiter,
				box_storage_base:
					parseFloat(item.boxStorageBase.replace(',', '.')) || null,
				box_storage_coef_expr:
					parseFloat(item.boxStorageCoefExpr.replace(',', '.')) || null,
				box_storage_liter:
					parseFloat(item.boxStorageLiter.replace(',', '.')) || null,
			})
			.onConflict(['date', 'warehouse_name'])
			.merge()
	}

	console.log(`[WB] Updated tariffs: ${list.length} records`)
}
