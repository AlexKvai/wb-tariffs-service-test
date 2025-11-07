# WB Tariffs Service

Сервис для:

1. Регулярного получения тарифов Wildberries (короба)
2. Сохранения их в PostgreSQL по дням
3. Обновления данных в Google Sheets

## 🚀 Запуск

```bash
cp .env.example .env
# Указать WB_API_TOKEN и GOOGLE_SHEETS_IDS
# Создать google-service-account.json в config для подключения гугл аккаунта
# Запустить саму программу через
docker compose up --build
```
