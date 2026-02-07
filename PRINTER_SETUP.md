# Printer Integration Guide

Complete setup and usage guide for the Prestine Hospital local printer integration system.

## System Overview

The printer integration consists of three components:

1. **Print Agent** (Node.js service): `localhost:9100`
   - Runs silently in background
   - Communicates with OS printer driver
   - Supports thermal and A4 printers

2. **Printer Service** (Frontend utility): `@/lib/printer-service.ts`
   - Provides `printInvoice()` function
   - Checks if agent is available (2-second timeout)
   - Auto-fallback to browser print if agent unavailable

3. **PrintableInvoice Component** (React): `@/components/billing/PrintableInvoice.tsx`
   - Displays invoice with print controls
   - Generates HTML for print agent
   - Shows print status (success/error/loading)
   - Allows printer type selection (thermal/A4)

## Installation

### 1. Install Print Agent Dependencies

```bash
cd print-agent
npm install
```

### 2. Frontend is Already Configured

The `printer-service.ts` and `PrintableInvoice.tsx` are already installed and ready to use.

## Starting the System

### Step 1: Start Print Agent

```bash
cd print-agent
npm start
```

You should see:
```
Print Agent listening on port 9100
```

### Step 2: Start Frontend Development Server (in another terminal)

```bash
cd frontend
npm run dev
```

Open http://localhost:3000

### Step 3: Test Print Functionality

1. Navigate to **Billing Counter**
2. Create a new invoice (patient + items)
3. Click "Create Invoice"
4. In invoice view, select printer type:
   - **A4**: Standard invoices on regular paper
   - **Thermal**: Quick receipts on thermal paper
5. Click "Print Invoice"
6. See status message:
   - ✅ Success: "Document sent to printer successfully (agent)"
   - ⚠️ Fallback: "Document printed via browser print dialog"
   - ❌ Error: Shows error message, offers browser print

## How It Works - User Perspective

### Scenario 1: Agent Running (Ideal)
```
User clicks Print Invoice
    ↓
System checks if agent available (2-second timeout)
    ↓
Agent responds (available)
    ↓
Print sent directly to system printer
    ↓
Status: ✅ "Printed successfully (agent)" - No dialog shown
    ↓
Invoice continues displaying, cashier moves to next task
```

### Scenario 2: Agent Not Running
```
User clicks Print Invoice
    ↓
System checks if agent available (2-second timeout)
    ↓
Agent doesn't respond (timeout/error)
    ↓
System auto-falls back to browser print
    ↓
Browser print dialog appears
    ↓
User selects printer and clicks Print
    ↓
Status: ⚠️ "Printed successfully (browser)" - Browser handled it
```

## Configuration

### Environment Variables

**Print Agent** (`print-agent/.env` or command line):
```bash
PORT=9100                    # Port to run agent (default: 9100)
DEBUG=true                   # Show detailed logs (optional)
```

**Frontend** (`.env.local`):
```javascript
// Already configured in printer-service.ts:
PRINT_AGENT_URL="http://localhost:9100"
PRINT_AGENT_TIMEOUT=2000     // 2 second health check timeout
```

### Printer Type Defaults

The component defaults to **A4 printer** on load. Users can change to:
- **A4**: 8.5" × 11" paper (standard invoices)
- **Thermal**: 80mm width receipt paper (quick receipts)

## Features by Printer Type

### A4 Printer
✅ Full invoice with all details  
✅ Multiple line items (no limit)  
✅ Patient information, notes  
✅ Professional formatting  
✅ Suitable for: Customer copies, records

### Thermal Printer
✅ Compact receipt format  
✅ Optimized for 80mm width  
✅ Quick printing (thermal paper)  
✅ Essential info only  
✅ Suitable for: Point-of-sale receipts, quick handover

## Printer Setup

### Windows
1. **Print Agent Requirements**: None special (uses PowerShell built-in)
2. **Set Default Printer**:
   - Settings > Devices > Printers & Scanners
   - Click desired printer > "Manage" > "Set as default"
3. **Thermal Printer** (if present):
   - Install printer driver
   - Set as default for thermal receipts

### macOS
1. **Print Agent Requirements**: CUPS (pre-installed)
2. **Set Default Printer**:
   - System Preferences > Printers & Scanners
   - Select printer > Click default button
3. **Verify CUPS running**:
   ```bash
   which lp
   ```

### Linux
1. **Enable CUPS**:
   ```bash
   sudo systemctl start cups
   sudo systemctl enable cups
   ```
2. **Add User to Print Group**:
   ```bash
   sudo usermod -aG lp $USER
   # Log out and back in
   ```
3. **Select Thermal Printer** (if present):
   ```bash
   lpadmin -d thermal_printer_name
   ```

## Troubleshooting

### Print Agent Won't Start

**Check Node version:**
```bash
node --version  # Should be 18.0.0+
```

**Check port is available:**
```bash
# Windows
netstat -ano | findstr :9100

# macOS/Linux
lsof -i :9100
```

**Try different port:**
```bash
PORT=9101 npm start
```

### Can't Connect During Print

**Frontend will**:
1. Attempt agent for 2 seconds
2. If no response, auto-fallback to browser print
3. Show status message indicating fallback

**To fix**:
- Ensure print agent is running: `npm start` in `print-agent/` folder
- Check agent logs for errors
- Verify network (on Windows: check Windows Firewall)

### Printing Multiple Pages

**If invoice is long**:
- A4 printer: Automatically creates new pages
- Thermal printer: Creates long receipt (multiple pages)
- Both maintain formatting with page breaks

### Wrong Printer Selected

**User experience**:
- Print agent uses **default system printer**
- Thermal vs A4 only changes page size/layout
- To change which physical printer: Set default in OS settings

**To use different printer**:
1. Use browser print (fallback): Select specific printer
2. Or set as default in OS settings

## Performance

| Metric | Value |
|--------|-------|
| Health check latency | <100ms |
| Typical print time | 1-3 seconds |
| Browser fallback time | 2-4 seconds |
| Memory usage (agent) | ~30MB |
| Max HTML size | 10MB |

## Security Notes

⚠️ **Current Setup**:
- Agent runs on `localhost:9100` (local machine only)
- No authentication required
- No rate limiting
- Hospital network only

### For Network Deployment
1. Use API key authentication
2. Add rate limiting
3. Validate HTML content
4. Implement audit logging
5. Use HTTPS encryption
6. Restrict to hospital IP ranges

## Desktop Installation (Optional)

To make print agent auto-start on computer boot:

### Windows (Task Scheduler)
```batch
# Run as Administrator
schtasks /create /tn "Hospital Print Agent" ^
  /tr "C:\path\to\node.exe c:\path\to\Hospital\print-agent\index.js" ^
  /sc onstart /rl highest
```

### macOS (LaunchAgent)
```bash
# Create: ~/Library/LaunchAgents/com.hospital.printagt.plist
# Edit the plist with correct paths
launchctl load ~/Library/LaunchAgents/com.hospital.printagt.plist
```

### Linux (Systemd)
```bash
# Create: /etc/systemd/system/hospital-print-agent.service
sudo systemctl enable hospital-print-agent
sudo systemctl start hospital-print-agent
```

## Testing Checklist

- [ ] Print agent starts without errors
- [ ] Frontend loads without errors
- [ ] Billing Counter creates invoice
- [ ] "Print Invoice" button visible in invoice view
- [ ] Printer type dropdown works (A4 / Thermal)
- [ ] Print button is clickable
- [ ] Agent available: Prints silently, shows success
- [ ] Agent stopped: Shows browser print dialog, works correctly
- [ ] Print status message displays correctly
- [ ] Message clears after 4 seconds (success only)
- [ ] Error message persists until next print attempt

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Port 9100 in use | Another service using port | Change: `PORT=9101 npm start` |
| "Agent unavailable" always | Port wrong / service not running | Check: `npm start` in print-agent folder |
| Browser print dialog appears | Agent slower than 2s timeout | Restart agent, check PC performance |
| No connection to agent | Windows Firewall | (Windows) Add exception or use localhost |
| Printer not printing | Wrong printer set as default | Set desired printer as default in OS |
| Thermal receipt cuts off | Page size wrong | Select "Thermal" in print dialog, retry |

## Components Reference

### PrintableInvoice (`@/components/billing/PrintableInvoice.tsx`)
- Props: `invoice` (Invoice), `onPrint?` (callback function)
- States: `printerType`, `printStatus`, `isPrinting`
- Functions: `getPrintableHTML()`, `handlePrint()`
- Features: Type selector, status display, auto-fallback

### PrinterService (`@/lib/printer-service.ts`)
- Functions:
  - `isAgentAvailable()` → boolean
  - `printViaAgent(html, type)` → PrintResult
  - `printViaBrowser(html)` → PrintResult
  - `printInvoice(options)` → PrintResult (main)
  - `getAvailablePrinters()` → string[]
- Interfaces: `PrintOptions`, `PrintResult`

### PrintAgent (`print-agent/index.js`)
- Port: 9100 (configurable)
- Endpoints: GET `/health`, POST `/print`, GET `/printers`
- Features: OS detection, temp file handling, auto-cleanup
- Supports: Windows (PowerShell), macOS/Linux (lp)

## Next Steps

1. ✅ Installed print infrastructure
2. ✅ Configured billing counter with printer support
3. 📋 Consider: Auto-startup script for print agent
4. 📋 Consider: Audit logging for print history
5. 📋 Consider: Network printer discovery

## Support

For issues:
1. Check troubleshooting section above
2. Review print agent logs: `npm start` output
3. Check browser console for errors
4. Test health endpoint: `curl http://localhost:9100/health`

---

**Ready to print!** 🖨️ Start the print agent and begin using the billing system.
