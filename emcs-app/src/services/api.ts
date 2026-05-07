const INITIAL_DATA = {
  "users": [
    { "id": "1", "name": "Budi Santoso", "role": "User", "email": "user@emcs.local", "password": "password123", "department": "Maintenance", "status": "Active" },
    { "id": "2", "name": "Agus Pratama", "role": "Supervisor", "email": "spv@emcs.local", "password": "password123", "department": "Maintenance", "status": "Active" },
    { "id": "3", "name": "Rina Wijaya", "role": "Dept Head", "email": "head@emcs.local", "password": "password123", "department": "Maintenance", "status": "Active" },
    { "id": "4", "name": "Dewi Lestari", "role": "User", "email": "dewi@emcs.local", "password": "password123", "department": "Warehouse", "status": "Active" },
    { "id": "5", "name": "Eko Purnomo", "role": "Supervisor", "email": "eko@emcs.local", "password": "password123", "department": "Warehouse", "status": "Active" },
    { "id": "6", "name": "Sari Indah", "role": "User", "email": "sari@emcs.local", "password": "password123", "department": "Production", "status": "Inactive" },
    { "id": "7", "name": "Hendra Wijaya", "role": "Manager", "email": "hendra@emcs.local", "password": "password123", "department": "Procurement", "status": "Active" },
    { "id": "8", "name": "Lusi Aprilia", "role": "User", "email": "lusi@emcs.local", "password": "password123", "department": "Quality", "status": "Active" },
    { "id": "9", "name": "Taufik Hidayat", "role": "Supervisor", "email": "taufik@emcs.local", "password": "password123", "department": "Production", "status": "Active" },
    { "id": "10", "name": "Admin EMCS", "role": "Admin", "email": "admin@emcs.local", "password": "password123", "department": "IT", "status": "Active" }
  ],
  "materials": [
    { "id": "M001", "materialNo": "100-200-300", "description": "Bearing SKF 6204", "plant": "PL01", "location": "WH-A", "uom": "PCS", "batch": "B2023", "serial": "-", "stock": 15, "minLevel": 20, "maxLevel": 100 },
    { "id": "M002", "materialNo": "100-200-301", "description": "V-Belt B-42", "plant": "PL01", "location": "WH-B", "uom": "PCS", "batch": "B2023", "serial": "-", "stock": 50, "minLevel": 10, "maxLevel": 100 },
    { "id": "M003", "materialNo": "200-100-500", "description": "Hydraulic Oil ISO 68", "plant": "PL02", "location": "WH-L", "uom": "LITER", "batch": "B2024", "serial": "S-991", "stock": 5, "minLevel": 50, "maxLevel": 200 },
    { "id": "M004", "materialNo": "300-400-100", "description": "Safety Gloves Cotton", "plant": "PL01", "location": "WH-S", "uom": "PAIRS", "batch": "-", "serial": "-", "stock": 120, "minLevel": 100, "maxLevel": 500 },
    { "id": "M005", "materialNo": "300-400-200", "description": "Safety Helmet Yellow", "plant": "PL01", "location": "WH-S", "uom": "PCS", "batch": "H2024", "serial": "-", "stock": 45, "minLevel": 50, "maxLevel": 150 },
    { "id": "M006", "materialNo": "400-100-100", "description": "Conveyor Belt Rubber 5m", "plant": "PL02", "location": "WH-M", "uom": "ROLL", "batch": "CB-01", "serial": "S-100", "stock": 2, "minLevel": 5, "maxLevel": 10 },
    { "id": "M007", "materialNo": "500-200-300", "description": "Motor 3 Phase 5HP", "plant": "PL01", "location": "WH-E", "uom": "UNIT", "batch": "M2023", "serial": "SN-0098", "stock": 8, "minLevel": 10, "maxLevel": 20 },
    { "id": "M008", "materialNo": "500-200-305", "description": "Contactor Schneider 32A", "plant": "PL01", "location": "WH-E", "uom": "PCS", "batch": "C2024", "serial": "-", "stock": 25, "minLevel": 20, "maxLevel": 80 },
    { "id": "M009", "materialNo": "600-100-400", "description": "Filter Cartridge Air", "plant": "PL02", "location": "WH-M", "uom": "PCS", "batch": "F2023", "serial": "-", "stock": 10, "minLevel": 30, "maxLevel": 100 },
    { "id": "M010", "materialNo": "700-300-100", "description": "Lubricant Grease 1kg", "plant": "PL02", "location": "WH-L", "uom": "CAN", "batch": "G2024", "serial": "-", "stock": 85, "minLevel": 50, "maxLevel": 200 },
    { "id": "M011", "materialNo": "100-300-400", "description": "Chain Drive RS-60", "plant": "PL01", "location": "WH-A", "uom": "METER", "batch": "-", "serial": "-", "stock": 15, "minLevel": 10, "maxLevel": 50 },
    { "id": "M012", "materialNo": "200-500-600", "description": "Pneumatic Cylinder 50mm", "plant": "PL02", "location": "WH-M", "uom": "PCS", "batch": "P2023", "serial": "SN-112", "stock": 4, "minLevel": 5, "maxLevel": 15 },
    { "id": "M013", "materialNo": "800-100-200", "description": "PLC CPU Module S7-1200", "plant": "PL01", "location": "WH-E", "uom": "PCS", "batch": "IT-01", "serial": "SN-9988", "stock": 3, "minLevel": 2, "maxLevel": 5 },
    { "id": "M014", "materialNo": "900-200-100", "description": "Grinding Wheel 7 inch", "plant": "PL01", "location": "WH-B", "uom": "PCS", "batch": "W-24", "serial": "-", "stock": 40, "minLevel": 50, "maxLevel": 200 },
    { "id": "M015", "materialNo": "900-200-150", "description": "Cutting Disc 4 inch", "plant": "PL01", "location": "WH-B", "uom": "PCS", "batch": "C-24", "serial": "-", "stock": 150, "minLevel": 100, "maxLevel": 500 },
    { "id": "M016", "materialNo": "300-100-100", "description": "Bolt & Nut M12x50", "plant": "PL01", "location": "WH-A", "uom": "SET", "batch": "-", "serial": "-", "stock": 1200, "minLevel": 500, "maxLevel": 2000 },
    { "id": "M017", "materialNo": "300-100-120", "description": "Bolt & Nut M16x80", "plant": "PL01", "location": "WH-A", "uom": "SET", "batch": "-", "serial": "-", "stock": 450, "minLevel": 500, "maxLevel": 1500 },
    { "id": "M018", "materialNo": "400-500-200", "description": "Welding Electrode E6013", "plant": "PL02", "location": "WH-L", "uom": "BOX", "batch": "W-2023", "serial": "-", "stock": 12, "minLevel": 20, "maxLevel": 50 },
    { "id": "M019", "materialNo": "500-100-200", "description": "Inverter VFD 2.2kW", "plant": "PL01", "location": "WH-E", "uom": "UNIT", "batch": "E-2024", "serial": "SN-VFD01", "stock": 1, "minLevel": 2, "maxLevel": 5 },
    { "id": "M020", "materialNo": "600-200-100", "description": "O-Ring Seal Kit Nitrile", "plant": "PL02", "location": "WH-M", "uom": "KIT", "batch": "K-24", "serial": "-", "stock": 8, "minLevel": 10, "maxLevel": 30 },
    { "id": "M021", "materialNo": "110-220-330", "description": "Solenoid Valve 24VDC", "plant": "PL01", "location": "WH-M", "uom": "PCS", "batch": "V-2023", "serial": "-", "stock": 14, "minLevel": 10, "maxLevel": 25 },
    { "id": "M022", "materialNo": "120-230-340", "description": "Pressure Gauge 10 Bar", "plant": "PL02", "location": "WH-L", "uom": "PCS", "batch": "G-2024", "serial": "-", "stock": 6, "minLevel": 5, "maxLevel": 12 },
    { "id": "M023", "materialNo": "130-240-350", "description": "Limit Switch Honeywell", "plant": "PL01", "location": "WH-E", "uom": "PCS", "batch": "S-2023", "serial": "-", "stock": 22, "minLevel": 15, "maxLevel": 40 },
    { "id": "M024", "materialNo": "140-250-360", "description": "Emergency Stop Button", "plant": "PL01", "location": "WH-E", "uom": "PCS", "batch": "B-2024", "serial": "-", "stock": 9, "minLevel": 10, "maxLevel": 30 },
    { "id": "M025", "materialNo": "150-260-370", "description": "Terminal Block 2.5mm", "plant": "PL01", "location": "WH-E", "uom": "PCS", "batch": "-", "serial": "-", "stock": 450, "minLevel": 200, "maxLevel": 1000 }
  ],
  "requests": [
    { "id": "R001", "userId": "1", "materialId": "M001", "qty": 50, "status": "Approved_Supervisor", "requestedAt": "2026-05-01T10:00:00Z", "justification": "Restock for upcoming maintenance", "comment": "Verified stock level.", "type": "Purchase Request" },
    { "id": "R002", "userId": "1", "materialId": "M003", "qty": 100, "status": "Approved_DeptHead", "requestedAt": "2026-05-02T14:30:00Z", "justification": "Critical low stock level", "comment": "Approved. Proceed to procurement.", "type": "Purchase Request" },
    { "id": "R003", "userId": "4", "materialId": "M005", "qty": 50, "status": "Pending", "requestedAt": "2026-05-06T08:15:00Z", "justification": "New worker batch arrival next week", "comment": "", "type": "Purchase Request" },
    { "id": "R012", "userId": "1", "materialId": "M018", "qty": 30, "status": "Approved_Manager", "requestedAt": "2026-05-05T15:20:00Z", "justification": "Stock replenishment", "comment": "Approved at manager level.", "type": "Goods Issue (GI)" },
    { "id": "R013", "userId": "4", "materialId": "M024", "qty": 15, "status": "Pending", "requestedAt": "2026-05-06T14:50:00Z", "justification": "Safety audit requirement", "comment": "", "type": "Purchase Request" },
    { "id": "R014", "userId": "1", "materialId": "M001", "qty": 10, "status": "Approved_Supervisor", "requestedAt": "2026-05-06T15:00:00Z", "justification": "Urgent repair Line 2", "comment": "Verified by SPV.", "type": "Goods Receipt (GR)" }
  ],
  "planned_orders": [
    { "id": "PO001", "materialId": "M001", "suggestedQty": 85, "status": "Open", "createdAt": "2026-05-06T07:00:00Z", "reason": "Stock below minimum level" },
    { "id": "PO002", "materialId": "M003", "suggestedQty": 195, "status": "Open", "createdAt": "2026-05-06T07:00:00Z", "reason": "Stock critically below minimum" }
  ],
  "logs": [
    { "id": "L001", "userId": "2", "action": "APPROVE", "target": "Request R001", "detail": "Approved material request for Bearing SKF 6204", "timestamp": "2026-05-03T09:15:00Z" }
  ]
};

const DB_KEY = 'emcs_db';

const getDb = () => {
  const saved = localStorage.getItem(DB_KEY);
  if (!saved) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(saved);
};

const saveDb = (data: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

export const mockApi = {
  getUsers: async () => getDb().users,
  getMaterials: async () => getDb().materials,
  getRequests: async () => getDb().requests,
  getPlannedOrders: async () => getDb().planned_orders,
  getLogs: async () => getDb().logs,

  login: async (email: string) => {
    const users = getDb().users;
    return users.find((u: any) => u.email === email) || null;
  },

  createRequest: async (request: any) => {
    const db = getDb();
    db.requests.push(request);
    saveDb(db);
    return request;
  },

  updateRequest: async (id: string, updates: any) => {
    const db = getDb();
    const index = db.requests.findIndex((r: any) => r.id === id);
    if (index !== -1) {
      db.requests[index] = { ...db.requests[index], ...updates };
      saveDb(db);
    }
    return db.requests[index];
  },

  createPlannedOrder: async (order: any) => {
    const db = getDb();
    db.planned_orders.push(order);
    saveDb(db);
    return order;
  },

  addLog: async (log: any) => {
    const db = getDb();
    db.logs.unshift({ id: 'L' + Date.now(), ...log });
    saveDb(db);
  },

  updateUser: async (id: string, updates: any) => {
    const db = getDb();
    const index = db.users.findIndex((u: any) => u.id === id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...updates };
      saveDb(db);
    }
    return db.users[index];
  }
};
