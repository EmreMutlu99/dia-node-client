# dia-node-client
 A Node.js client library for integrating with the DIA ERP Web Services (v3). Provides convenient methods to login/logout, manage salons, and perform full reservation CRUD operations (create, update, list, delete) via DIA’s REST/JSON API.

# Status

Currently supports **login/logout** and the **Restaurant (RST) module** (salons & reservations).

# To Do

The DIA Web Service includes many other modules, identified by their three-letter prefixes.
These can be implemented next:

ith_* → Import / Customs

efa_* → e-Invoice / e-Delivery

muh_* → Accounting / Finance

rpr_* → Reporting

tsifm_* → Sales & Promotions

scf_* → Supply Chain / Stock / Purchasing

per_* → Personnel / HR

ure_* → Production / Manufacturing

msj_* → Messaging

miy_* → CRM / Opportunities

bcs_* → Bank & Treasury

dmr_* → Fixed Assets (Demirbaş)

krg_* → Cargo / Logistics

gts_* → Task / Workflow

prj_* → Project Management

dag_* → Distribution / Route Planning

sis_* → System / Core Services

web_* → Web Users / Permissions

shy_* → Service & Maintenance

ote_* → Hotel / Tourism (Reservations, Rooms, Deposits)

dia_* → DIA Membership / Users

---

## Installation

```bash
git clone https://github.com/your-repo/dia-node-client.git
cd dia-node-client
npm install
```

# Configuration
Create a .env file in the project root with your DIA credentials:

```bash
DIA_WS_URL=https://diademo.ws.dia.com.tr/api/v3/
DIA_USERNAME=myuser
DIA_PASSWORD=mypassword
DIA_API_KEY=your-api-key-here
DIA_FIRMA_KODU=1
DIA_DONEM_KODU=1
```

# Usage
Run the example:

```bash
node example/example.js
```