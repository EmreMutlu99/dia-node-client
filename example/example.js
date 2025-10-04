// index.js
require("dotenv").config();
const DiaClient = require("../src/dia-node-client");

// --- helpers ---
function requireEnv(key) {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

function parseIntEnv(key) {
  const n = parseInt(requireEnv(key), 10);
  if (isNaN(n)) throw new Error(`Env ${key} must be an integer`);
  return n;
}

(async () => {
  const dia = new DiaClient({
    source_ws_url: requireEnv("DIA_WS_URL"),
    username: requireEnv("DIA_USERNAME"),
    password: requireEnv("DIA_PASSWORD"),
    api_key: requireEnv("DIA_API_KEY"),
    firma_kodu: parseIntEnv("DIA_FIRMA_KODU"),
    donem_kodu: parseIntEnv("DIA_DONEM_KODU"),
  });

  try {
    // --- LOGIN ---
    await dia.login();
    console.log("Login successful");
    console.log("Context:", dia.getContext());

    // --- LIST SALONS ---
    const salonsResp = await dia.listSalons();
    const target = salonsResp.result.find((s) => s.salonadi === "BAHCE");
    console.log("Target Salon:", target);
    if (!target) throw new Error("Salon 'BAHCE' not found");

    // --- GENERATE RANDOM RESERVATION ID ---
    const randomId = "WS" + Math.floor(Math.random() * 100000);

    // --- ADD RESERVATION TEST ---
    const reservationResp = await dia.addReservation({
      kodu: randomId,
      adsoyad: "DENEME",
      eposta: "dia@gmail.com",
      telefon: "5556667788",
      kisisayisi: 2,
      cocuksayisi: 1,
      bebekayisi: 1,
      durum: "B",
      salonadi: target.salonadi, // should be "BAHCE"
      masakeys: [2527], // ⚠️ must exist in DIA
      tarih: "2025-10-21", /// YYYYY-MM-DD
      saat: "12:00:00",
      not1: "BEBEK KOLTUĞU İSTENİYOR",
      not2: "",
      not3: "",
      secilen_her_masa_icın_ayri_rezervasyon_fisi_olusturma: false,
    });

    console.log("Reservation response:", reservationResp);

    // --- Update directly using returned key ---
    const reservationKey = Number(reservationResp.key); // "3355" -> 3355

    const updateResp = await dia.updateReservation({
      _key: reservationKey, // <-- pulled from the set reservation response
      kodu: randomId, // same code
      adsoyad: "DENEME GÜNCEL", // demo change
      telefon: "5556667788",
      eposta: "dia@gmail.com",
      kisisayisi: 3, // demo change
      cocuksayisi: 1,
      bebeksayisi: 1,
      tarih: "2025-12-01", // keep valid (future) date
      saat: "13:30:00", // demo change
      salonadi: target.salonadi, // still "BAHCE"
      masakeys: [2527], // same table(s) or adjust if needed
      seviyekodu: 0,
      not1: "REZERVASYON GÜNCELLEME",
      not2: "",
      not3: "",
    });

    console.log("Update response:", updateResp);

    // --- DELETE RESERVATION ---
    const deleteResp = await dia.deleteReservation({ key: reservationKey });
    console.log("Delete response:", deleteResp);

    const reservationsResp = await dia.listReservations({
      limit: 5,
      offset: 0,
    });
    console.log("Reservations:", reservationsResp);

    // --- LOGOUT ---
    await dia.logout();
    console.log("Logout successful");
  } catch (err) {
    console.error("❌ Failed in DIA flow:", err.message);
  }
})();
