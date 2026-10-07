# 23-maktab — sayt + admin panel + Telegram bot

```
frontend/   React (Vite) sayt va /admin paneli  → Vercel'ga
backend/    PHP + MySQL API va Telegram bot      → hostingga (PHP 7.4+)
```

Hamma narsa **bitta bazadan** ishlaydi: admin panelda qo'shgan o'qituvchi, dars jadvali, yangilik — saytda ham, botda ham ko'rinadi.

## 1. Backend (hosting)
1. `backend/` ichidagi hamma fayllarni hostingdagi `23maktab/` papkasiga yuklang (eskilarini almashtiring).
2. `config.php` ni tekshiring: baza ma'lumotlari, `BOT_TOKEN`, `PUBLIC_BASE_URL` (backend manzili), `CRON_KEY`.
3. Brauzerda oching: `https://HOSTING/23maktab/setup.php?key=<SETUP_KEY>`
   Jadvallar yaratiladi / yangilanadi, `uploads/` papkasi ochiladi, namunaviy ma'lumotlar qo'shiladi
   (kerak bo'lmasa `&seed=0`). Admin kirishi: login `maktab-12`, parol `010203` (mavjud admin bo'lsa `&reset_admin=1` qo'shing). **Kirgach, Sozlamalar bo'limida parolni kamida 8 belgili qilib almashtiring.**
4. `setup.php` ni serverdan **o'chiring**.
5. `uploads/` papkasiga yozish huquqi bo'lsin (755/775).

## 2. Frontend (Vercel)
- `vercel.json` da `/backend/*` hostingga yo'naltirilgan (manzil boshqa bo'lsa o'zgartiring).
- Lokal: `npm install && npm run dev` (`VITE_BACKEND_ORIGIN` orqali backendga ulanadi, `.env.example` ga qarang).
- Admin panel: `https://SAYT/admin`.

## 3. Telegram bot
Admin panel → **Telegram bot** → «Botni ulash» (webhook va buyruqlar o'rnatiladi).
Bot: o'quvchi sinfini tugmalar bilan tanlaydi; o'qituvchi admin bergan kod bilan kiradi.
Menyu: Hozir / Keyingi / Bugun / Ertaga / Hafta / Qo'ng'iroqlar / O'qituvchilar / Sozlamalar.
**Eslatmalar** (dars boshlanishidan 5 daqiqa oldin) uchun hostingda cron qo'shing (har daqiqa):
`* * * * * curl -s "https://HOSTING/23maktab/cron.php?key=<CRON_KEY>" > /dev/null`

## Admin panelda nimalar bor
Boshqaruv, O'qituvchilar (rasm, fan, kod), Sinflar, Dars jadvali (katakchali, to'qnashuv tekshiruvi),
Qo'ng'iroqlar, Telegram bot (holat, e'lon yuborish, foydalanuvchilar), Yangiliklar, Galereya,
Sozlamalar (aloqa, ijtimoiy tarmoq, parol), Faoliyat jurnali.
Saytda admin sifatida kirib «Matnlarni tahrirlash» orqali matnlarni o'zgartirish ham mumkin.

## Xavfsizlik
- `config.php` dagi bot tokeni va baza paroli ochiq matnda — faylni GitHub'ga qo'ymang.
  Token begonalarga ko'rinib qolgan bo'lsa, @BotFather orqali yangilang (`/revoke`).
- Admin kirishi: 10 ta xato urinishdan keyin 15 daqiqa bloklanadi.
