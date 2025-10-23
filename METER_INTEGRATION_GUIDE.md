# Real-Time Meter Integration Guide
## Vikram Solar Falta EMS - Live Data Dashboard

---

## 📋 Overview

Your facility has **79 energy meters** (Schneider Electric EM 1200, EM 6400, EM 6400NG) with RS485/Modbus communication. This guide shows how to integrate them for real-time monitoring.

---

## 🔌 Hardware Requirements

### 1. **RS485 to USB Converter**
   - **Recommended Models:**
     - FTDI USB-RS485 Converter (Industrial grade)
     - Waveshare USB to RS485 Converter
     - Moxa UPort 1150 (USB to RS485)
   - **Price Range:** ₹800 - ₹3,000
   - **Where to Buy:** Amazon, Robu.in, Industrial suppliers

### 2. **RS485 Network Topology**
   ```
   Laptop/PC
      |
   USB Port
      |
   USB-to-RS485 Converter
      |
   RS485 Bus (A+, B-, GND)
      |
   ├── Meter 1 (Address 1)
   ├── Meter 2 (Address 2)
   ├── Meter 3 (Address 3)
   └── ... (up to 247 devices)
   ```

### 3. **Wiring Details**
   - **RS485 uses 3 wires:**
     - **A+ (Data+)** - Usually Green
     - **B- (Data-)** - Usually Yellow
     - **GND (Common Ground)** - Usually Black/Brown
   
   - **Connection Type:** Daisy-chain (one meter to next)
   - **Max Cable Length:** 1200m (4000 feet)
   - **Termination:** 120Ω resistor at both ends of the bus

---

## 🔧 Physical Setup Steps

### Step 1: Verify Meter Communication Settings
For Schneider EM meters, you need to know:
- **Modbus Address** (1-247, unique per meter)
- **Baud Rate** (typically 9600 or 19200)
- **Parity** (usually None or Even)
- **Stop Bits** (1 or 2)
- **Data Bits** (8)

**Default Settings (Schneider EM series):**
```
Baud Rate: 9600 bps
Parity: Even
Data Bits: 8
Stop Bits: 1
Protocol: Modbus RTU
```

### Step 2: Configure Meter Addresses
Each meter MUST have a unique Modbus address:
- Access meter LCD panel or web interface
- Navigate to Communication settings
- Set unique address (1-79)
- Document the address mapping

**Recommended Address Mapping:**
```
Meter ID #1 (Grid Incommer) → Modbus Address 1
Meter ID #2 (33 KV INCOMER) → Modbus Address 2
... and so on
```

### Step 3: Physical Wiring
1. **Connect USB-RS485 adapter** to your laptop
2. **Wire meters in daisy-chain:**
   ```
   Converter → Meter 1 → Meter 2 → ... → Meter N
   ```
3. **Add termination resistors** at both ends (120Ω)
4. **Ensure proper grounding**

---

## 💻 Software Implementation

### Architecture Overview
```
┌─────────────────────────────────────────────┐
│           Frontend (React/Vite)             │
│  - Real-time dashboard with live updates   │
│  - Charts showing power consumption         │
└───────────────┬─────────────────────────────┘
                │ WebSocket Connection
                │
┌───────────────▼─────────────────────────────┐
│       Backend Server (Node.js)              │
│  - WebSocket server for real-time updates  │
│  - REST APIs for historical data           │
│  - Data aggregation and processing         │
└───────────────┬─────────────────────────────┘
                │
┌───────────────▼─────────────────────────────┐
│     Modbus Service (Python/Node.js)         │
│  - Reads data from meters via RS485        │
│  - Polls meters every 1-5 seconds          │
│  - Stores in SQLite database               │
└───────────────┬─────────────────────────────┘
                │ Serial/RS485
                │
┌───────────────▼─────────────────────────────┐
│          Physical Meters (79 units)         │
│  Schneider EM 1200, EM 6400, EM 6400NG     │
└─────────────────────────────────────────────┘
```

---

## 📦 Required Python Packages

Create a Modbus data collector service:

```bash
# Install Python dependencies
pip install pymodbus pyserial sqlalchemy websockets aiohttp
```

---

## 🐍 Modbus Data Collector (Python Service)

I'll create a complete Python service that:
1. Reads data from all 79 meters
2. Stores readings in SQLite
3. Sends real-time updates via WebSocket

### Key Modbus Registers for Schneider EM Meters

| Parameter | Register | Type | Unit |
|-----------|----------|------|------|
| Voltage L1-N | 3028 | Float | V |
| Voltage L2-N | 3030 | Float | V |
| Voltage L3-N | 3032 | Float | V |
| Current L1 | 3000 | Float | A |
| Current L2 | 3002 | Float | A |
| Current L3 | 3004 | Float | A |
| Active Power Total | 3054 | Float | kW |
| Reactive Power Total | 3068 | Float | kVAr |
| Apparent Power Total | 3076 | Float | kVA |
| Power Factor Total | 3084 | Float | - |
| Frequency | 3110 | Float | Hz |
| Active Energy Total | 3204 | Float | kWh |

---

## 🚀 Quick Start Implementation

### Option 1: Using Python (Recommended for Modbus)

I'll create:
1. `backend/modbus-service/` - Python service to read meters
2. `backend/websocket-server/` - Real-time data distribution
3. Update frontend to show live data

### Option 2: Using Node.js (Alternative)

Use `modbus-serial` package for Node.js integration.

---

## 📊 Data Flow

1. **Every 2 seconds:**
   - Python service polls next batch of meters (round-robin)
   - Reads voltage, current, power, energy
   - Validates data and stores in database

2. **Real-time Updates:**
   - WebSocket pushes new readings to connected clients
   - Frontend updates charts and KPIs instantly

3. **Historical Data:**
   - Store all readings with timestamps
   - Provide APIs for historical analysis
   - Generate reports and trends

---

## 🛠️ Testing Setup

### Test with Single Meter First

1. **Connect one meter** to USB-RS485 adapter
2. **Find COM port:**
   ```bash
   # Windows
   mode
   
   # Linux
   ls /dev/ttyUSB*
   ```

3. **Test Modbus communication:**
   ```python
   from pymodbus.client import ModbusSerialClient
   
   client = ModbusSerialClient(
       port='COM3',  # Your COM port
       baudrate=9600,
       parity='E',
       stopbits=1,
       bytesize=8,
       timeout=1
   )
   
   if client.connect():
       # Read voltage from address 1
       result = client.read_holding_registers(3028, 2, unit=1)
       print(f"Voltage: {result.registers}")
       client.close()
   ```

---

## 📈 Expected Dashboard Features

### Real-Time Display
- ✅ Live voltage, current, power for each meter
- ✅ Total facility consumption (kW)
- ✅ Power factor monitoring
- ✅ Energy consumption trends
- ✅ Alarm notifications (over-current, under-voltage)

### Analytics
- ✅ Hourly/Daily/Monthly consumption reports
- ✅ Peak demand analysis
- ✅ Equipment-wise energy breakdown
- ✅ Cost calculations
- ✅ Export to Excel/PDF

---

## ⚠️ Important Considerations

### 1. **Polling Strategy**
   - Don't poll all 79 meters simultaneously
   - Use round-robin: poll 10-15 meters per second
   - Full cycle every 5-10 seconds

### 2. **Error Handling**
   - Meter offline detection
   - Communication timeout handling
   - Data validation and bounds checking

### 3. **Data Storage**
   - Raw readings: Store every reading
   - Aggregated data: Minute, hour, day averages
   - Retention policy: Keep raw data for 7 days, aggregated forever

### 4. **Network Reliability**
   - RS485 is industrial-grade and reliable
   - Use proper shielded cables
   - Avoid running near high-voltage cables

---

## 🎯 Next Steps

Would you like me to:

1. **Create the complete Python Modbus service** that reads from your meters?
2. **Add WebSocket support** to your existing Node.js backend?
3. **Update the frontend** to display real-time meter readings?
4. **Create database schema** for storing meter readings?
5. **All of the above** - Complete integration?

Let me know and I'll implement the full solution!

---

## 📞 Support Resources

### Schneider Electric Documentation
- [PowerLogic EM Series User Guide](https://www.se.com)
- Modbus register maps for EM 1200, EM 6400

### Python Modbus Libraries
- [pymodbus Documentation](https://pymodbus.readthedocs.io/)
- [minimalmodbus](https://minimalmodbus.readthedocs.io/) - Simpler alternative

### Hardware Suppliers (India)
- Robu.in - Electronics components
- Amazon India - USB-RS485 converters
- Local electrical distributors - Schneider products
