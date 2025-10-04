// diaClient.js
const axios = require("axios");

class DiaClient {
  constructor({
    source_ws_url,
    username,
    password,
    api_key,
    firma_kodu,
    donem_kodu,
  }) {
    this.source_ws_url = source_ws_url;
    this.username = username;
    this.password = password;
    this.api_key = api_key;
    this.firma_kodu = firma_kodu;
    this.donem_kodu = donem_kodu;
    this.session_id = null;
  }

  /**
   * Perform login to DIA Web Service
   */
  async login() {
    try {
      const payload = {
        login: {
          username: this.username,
          password: this.password,
          params: { apikey: this.api_key },
          disconnect_same_user: true,
          lang: "tr",
        },
      };

      const response = await axios.post(
        this.source_ws_url + "/sis/json",
        payload,
        { headers: { "Content-Type": "application/json;charset=UTF-8" } }
      );

      console.log("DIA login raw response:", response.data);

      if (response.data && response.data.code === "200" && response.data.msg) {
        this.session_id = response.data.msg; // msg is the session_id
        console.log("✅ Login successful. Session ID:", this.session_id);
      } else {
        throw new Error(
          `Login failed: ${response.data?.msg || "No session_id returned"}`
        );
      }

      return this.session_id;
    } catch (error) {
      console.error("❌ DIA login error:", error.message);
      throw error;
    }
  }

  /**
   * Logout from DIA Web Service
   */
  async logout() {
    if (!this.session_id) {
      console.warn("⚠️ No active session. Nothing to logout.");
      return false;
    }

    try {
      const payload = { logout: { session_id: this.session_id } };

      const response = await axios.post(
        this.source_ws_url + "/sis/json",
        payload,
        { headers: { "Content-Type": "application/json;charset=UTF-8" } }
      );

      console.log("DIA logout raw response:", response.data);

      if (response.data && response.data.code === "200") {
        console.log("✅ Logout successful.");
        this.session_id = null;
        return true;
      } else {
        throw new Error(
          `Logout failed: ${response.data?.msg || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("❌ DIA logout error:", error.message);
      throw error;
    }
  }

  /**
   * List salons
   */
  async listSalons({
    filters = "",
    sorts = "",
    params = "",
    limit = 10,
    offset = 0,
  } = {}) {
    if (!this.session_id) {
      throw new Error("You must login before calling listSalons.");
    }

    try {
      const payload = {
        rst_salon_listele: {
          session_id: this.session_id,
          firma_kodu: this.firma_kodu,
          donem_kodu: this.donem_kodu,
          filters,
          sorts,
          params,
          limit,
          offset,
        },
      };

      const response = await axios.post(
        this.source_ws_url + "/rst/json",
        payload,
        { headers: { "Content-Type": "application/json;charset=UTF-8" } }
      );

      console.log("DIA listSalons raw response:", response.data);

      if (response.data && response.data.code === "200") {
        return response.data;
      } else {
        throw new Error(
          `Failed to list salons: ${response.data?.msg || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("❌ DIA listSalons error:", error.message);
      throw error;
    }
  }

  /**
   * Get specific salon details by key
   */
  async getSalon({ key, params = "" }) {
    if (!this.session_id) {
      throw new Error("You must login before calling getSalon.");
    }

    try {
      const payload = {
        rst_salon_getir: {
          session_id: this.session_id,
          firma_kodu: this.firma_kodu,
          donem_kodu: this.donem_kodu,
          key: Number(key),
          params,
        },
      };

      const response = await axios.post(
        this.source_ws_url + "/rst/json",
        payload,
        { headers: { "Content-Type": "application/json;charset=UTF-8" } }
      );

      console.log("DIA getSalon raw response:", response.data);

      if (response.data && response.data.code === "200") {
        return response.data;
      } else {
        throw new Error(
          `Failed to get salon: ${response.data?.msg || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("❌ DIA getSalon error:", error.message);
      throw error;
    }
  }

  /**
   * Add reservation
   */
  async addReservation({
    kodu,
    adsoyad,
    eposta,
    telefon,
    kisisayisi, // ✅ corrected name
    cocuksayisi,
    bebekayisi,
    durum,
    salonadi,
    masakeys = [],
    tarih, // "YYYY-MM-DD"
    saat, // "HH:mm:ss"
    not1 = "",
    not2 = "",
    not3 = "",
    secilen_her_masa_icın_ayri_rezervasyon_fisi_olusturma = false,
  }) {
    if (!this.session_id) {
      throw new Error("You must login before calling addReservation.");
    }

    const payload = {
      rst_rezervasyon_ekle: {
        session_id: this.session_id,
        firma_kodu: this.firma_kodu,
        donem_kodu: this.donem_kodu,
        kart: {
          kodu,
          adsoyad,
          eposta,
          telefon,
          kisisayisi, // ✅ corrected
          cocuksayisi,
          bebekayisi,
          durum,
          _key_rst_salon: { salonadi },
          masakeys,
          tarih,
          saat,
          not1,
          not2,
          not3,
          _key_sis_seviyekodu: 0,
          secilen_her_masa_icın_ayri_rezervasyon_fisi_olusturma,
        },
      },
    };

    const response = await axios.post(
      this.source_ws_url + "/rst/json",
      payload,
      { headers: { "Content-Type": "application/json;charset=UTF-8" } }
    );

    console.log("DIA addReservation raw response:", response.data);

    if (response.data && response.data.code === "200") {
      return response.data;
    } else {
      throw new Error(
        `Failed to add reservation: ${response.data?.msg || "Unknown error"}`
      );
    }
  }

  /**
   * Update reservation
   */
  async updateReservation({
    _key, // reservation unique key
    kodu,
    adsoyad,
    telefon,
    eposta,
    kisisayisi,
    cocuksayisi,
    bebeksayisi,
    tarih, // "YYYY-MM-DD"
    saat, // "HH:mm:ss"
    durum,
    salonadi,
    masakeys = [],
    carikartkodu = null, // optional customer card key
    seviyekodu = 1,
    not1 = "",
    not2 = "",
    not3 = "",
  }) {
    if (!this.session_id) {
      throw new Error("You must login before calling updateReservation.");
    }

    const kart = {
      _key,
      kodu,
      adsoyad,
      telefon,
      eposta,
      kisisayisi,
      cocuksayisi,
      bebeksayisi,
      tarih,
      saat,
      durum,
      _key_rst_salon: { salonadi },
      masakeys,
      _key_sis_seviyekodu: seviyekodu,
      not1,
      not2,
      not3,
    };

    if (carikartkodu) {
      kart._key_scf_carikart = { carikartkodu };
    }

    const payload = {
      rst_rezervasyon_guncelle: {
        session_id: this.session_id,
        firma_kodu: this.firma_kodu,
        donem_kodu: this.donem_kodu,
        kart,
      },
    };

    const response = await axios.post(
      this.source_ws_url + "/rst/json",
      payload,
      { headers: { "Content-Type": "application/json;charset=UTF-8" } }
    );

    console.log("DIA updateReservation raw response:", response.data);

    if (response.data && response.data.code === "200") {
      return response.data;
    } else {
      throw new Error(
        `Failed to update reservation: ${response.data?.msg || "Unknown error"}`
      );
    }
  }

   /**
   * Delete reservations
   */
  async deleteReservation({ key, params = "" }) {
    if (!this.session_id) {
      throw new Error("You must login before calling deleteReservation.");
    }

    const payload = {
      rst_rezervasyon_sil: {
        session_id: this.session_id,
        firma_kodu: this.firma_kodu,
        donem_kodu: this.donem_kodu,
        key: String(key), // ✅ force string
        params, // ✅ default to "" not {}
      },
    };

    console.log("DIA deleteReservation payload:", payload);

    try {
      const response = await axios.post(
        this.source_ws_url + "/rst/json",
        payload,
        { headers: { "Content-Type": "application/json;charset=UTF-8" } }
      );

      console.log("DIA deleteReservation raw response:", response.data);

      if (response.data && response.data.code === "200") {
        return response.data;
      } else {
        throw new Error(
          `Failed to delete reservation: ${
            response.data?.msg || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("❌ DIA deleteReservation error:", error.message);
      throw error;
    }
  }

  /**
   * List reservations
   */
  async listReservations({
    filters = "",
    sorts = "",
    params = "",
    limit = 10,
    offset = 0,
  } = {}) {
    if (!this.session_id) {
      throw new Error("You must login before calling listReservations.");
    }

    const payload = {
      rst_rezervasyon_listele: {
        session_id: this.session_id,
        firma_kodu: this.firma_kodu,
        donem_kodu: this.donem_kodu,
        filters,
        sorts,
        params,
        limit,
        offset,
      },
    };

    console.log("DIA listReservations payload:", payload);

    try {
      const response = await axios.post(
        this.source_ws_url + "/rst/json",
        payload,
        { headers: { "Content-Type": "application/json;charset=UTF-8" } }
      );

      console.log("DIA listReservations raw response:", response.data);

      if (response.data && response.data.code === "200") {
        return response.data;
      } else {
        throw new Error(
          `Failed to list reservations: ${
            response.data?.msg || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("❌ DIA listReservations error:", error.message);
      throw error;
    }
  }

  /**
   * Return current context info
   */
  getContext() {
    return {
      session_id: this.session_id,
      firma_kodu: this.firma_kodu,
      donem_kodu: this.donem_kodu,
    };
  }
}

module.exports = DiaClient;
