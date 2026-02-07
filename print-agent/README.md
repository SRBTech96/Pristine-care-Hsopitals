# Hospital Print Agent

A lightweight Node.js Express server that provides silent printing capabilities to the Pristine Hospital billing system. Enables cashiers to print invoices directly to system printers without browser print dialogs.

## Overview

The print agent runs as a standalone service on `localhost:9100` and handles:
- **Silent printing** to system printers (thermal receipts or A4 documents)
- **OS-level printing** (Windows PowerShell, macOS/Linux `lp` command)
- **Automatic fallback** when unavailable (frontend reverts to browser print)
- **Printer discovery** (list available system printers)
- **Multiple printer types** (Thermal 80mm receipts, A4 standard)

## Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn

### Setup

```bash
cd print-agent
npm install
```

## Running the Service

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will start on `http://localhost:9100` (configurable via `PORT` environment variable).

### As a Background Service (Windows)

Using PM2 for process management:
```bash
npm install -g pm2
pm2 start index.js --name "hospital-print-agent"
pm2 startup
pm2 save
```

## API Endpoints

### Health Check
**GET** `/health`

Returns the current status of the print agent.

**Response:**
```json
{
  "status": "ok",
  "message": "Print agent is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Usage:** Frontend health checks (2-second timeout) to determine availability.

---

### Print Invoice
**POST** `/print`

Send HTML content to be printed on a system printer.

**Request Body:**
```json
{
  "html": "<html>...</html>",
  "printerType": "a4"
}
```

**Parameters:**
- `html` (string, required): Complete HTML document for printing
- `printerType` (string, optional): `"a4"` or `"thermal"` (default: `"a4"`)
  - `"a4"`: Standard A4 paper (8.5" × 11")
  - `"thermal"`: Thermal receipt printer (80mm × 200mm)

**Response (Success):**
```json
{
  "success": true,
  "message": "Document sent to printer successfully",
  "printer": "Default Printer",
  "warning": null
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Failed to execute print command",
  "error": "Error details here",
  "printer": "Unknown"
}
```

**Usage:**
1. Frontend captures invoice HTML from React component
2. Sends POST request with HTML and printer type
3. Agent creates temporary HTML file with print styles
4. Executes OS-specific print command
5. Cleans up temp file
6. Returns result status

---

### List Available Printers
**GET** `/printers`

Returns list of printers available on the system.

**Response:**
```json
{
  "success": true,
  "printers": ["Default Printer", "Brother Thermal", "HP LaserJet"],
  "message": "Retrieved 3 printer(s)"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "printers": ["Default Printer"],
  "message": "Failed to query printers, using default",
  "error": "PowerShell not available"
}
```

**Fallback:** Always returns at least `["Default Printer"]` to ensure a valid printer exists.

## Configuration

### Environment Variables

```bash
# Port to run the service on (default: 9100)
PORT=9100

# Optional: Log verbose printing details
DEBUG=true
```

### Print Styles

The agent automatically applies printer-specific page styles:

**A4 Printer:**
- Page size: 8.5" × 11"
- Margins: 0.5 inches
- Suitable for standard invoices

**Thermal Printer:**
- Page size: 80mm × 200mm width (3.15" × 7.87")
- Single-column layout
- Receipt box styling

## How It Works

### Print Flow

1. **Frontend Request**
   - User clicks "Print Invoice" in Billing Counter
   - React component captures invoice as HTML string
   - Sends POST request to `/print` endpoint with HTML and printer type

2. **Agent Processing**
   - Receives HTML payload (max 10MB JSON)
   - Wraps HTML in temporary file with CSS print styles
   - Detects operating system (Windows/macOS/Linux)

3. **OS-Specific Printing**
   - **Windows**: PowerShell `notepad.exe /p` command
   - **macOS**: `lp` command (Apple printer service)
   - **Linux**: `lp` command (CUPS printing)

4. **Cleanup**
   - Deletes temporary HTML file after 1 second
   - Returns success/error status
   - Timeout: 10 seconds per print job

5. **Frontend Fallback**
   - If agent unavailable: Use browser `window.print()`
   - If agent fails: Attempt browser print as fallback
   - User sees status message: "Printed via [method]"

## Troubleshooting

### Service Won't Start

**Check Node.js version:**
```bash
node --version  # Must be 18.0.0 or higher
```

**Check port availability:**
```bash
# Windows
netstat -ano | findstr :9100

# macOS/Linux
lsof -i :9100
```

**Solution:** Change port via environment variable:
```bash
PORT=9101 npm start
```

### Printing Not Working

**Windows Issues:**
- Notepad.exe might not have print permissions
- User Account Control (UAC) may block printing
- Solution: Run as Administrator or configure UAC settings

**macOS Issues:**
- `lp` command requires CUPS (usually pre-installed)
- Check: `which lp`

**Linux Issues:**
- CUPS daemon must be running: `systemctl status cups`
- User must be in `lp` group: `groups $USER | grep lp`

### Can't Connect to Agent

**From browser console:**
```javascript
fetch('http://localhost:9100/health')
  .then(r => r.json())
  .catch(err => console.error('Agent unreachable:', err));
```

**Solutions:**
1. Check if service is running: `npm start` in print-agent folder
2. Verify port: `PORT=9100 npm start`
3. Check Windows Firewall (add exception for Node.js)
4. Try different port if 9100 is in use

### Printer Not Found

**List available printers:**
```bash
curl http://localhost:9100/printers
```

**If "Default Printer" shown but not working:**
- Try selecting printer manually from browser print dialog (fallback)
- Windows: Set default printer in Settings > Devices > Printers & Scanners
- macOS: System Preferences > Printers & Scanners
- Linux: CUPS web UI or `lpadmin -d <printer_name>`

## Integration in Billing Counter

The billing system integrates the print agent as follows:

### Frontend Flow
1. User selects patient and invoice items
2. Clicks "Create Invoice" → Invoice saved
3. Views invoice detail page
4. Clicks "Print Invoice" button
5. Selects printer type (A4 or Thermal)
6. Status shows: "Printing..." → "Printed via [agent/browser]"

### Component Integration
- **PrintableInvoice.tsx**: Invokes `printInvoice()` from `printer-service.ts`
- **printer-service.ts**: Checks agent availability → Tries agent → Falls back to browser
- **print-agent/index.js**: Handles HTTP request → OS-level printing

### Error Handling
- Agent unavailable: Auto-fallback to browser print
- Agent fails: Show error, offer browser print option
- Network error: Treat as unavailable, use fallback
- Invalid HTML: Return error response

## Performance

- **Health check latency:** <100ms (typical)
- **Print job processing:** 1-3 seconds (including temp file cleanup)
- **Memory footprint:** ~30MB typical
- **Scalability:** Handles multiple sequential print requests, not concurrent (queued)

## Security Considerations

### Current Implementation
- No authentication (localhost-only)
- No rate limiting
- 10MB request size limit
- Works only on local machine (127.0.0.1)

### For Production Deployment on Network
1. Implement API key authentication
2. Add rate limiting (e.g., 5 prints/minute per user)
3. Validate HTML content (prevent malicious scripts)
4. Add HTTPS/TLS encryption
5. Restrict to hospital network
6. Implement audit logging (print history)

### For Public Networks
- Deploy only within hospital LAN
- Use VPN or firewall rules
- Never expose on public internet
- Implement proper authentication
- Log all print requests for compliance

## Logs

The agent logs all print operations to console with timestamps:

```
[2024-01-15T10:30:00.000Z] GET /health - Health check requested
[2024-01-15T10:30:05.000Z] POST /print - Printing invoice #INV-001 (A4, 450 bytes)
[2024-01-15T10:30:06.000Z] POST /print - Success: Document printed (Default Printer)
[2024-01-15T10:30:10.000Z] GET /printers - Retrieved 3 available printers
```

For persistent logging, pipe output:
```bash
npm start > print-agent.log 2>&1
```

## Stopping the Service

**In terminal:**
- Ctrl+C to stop

**If running with PM2:**
```bash
pm2 stop hospital-print-agent
pm2 delete hospital-print-agent
```

## Dependencies

- **express** ^4.18.2 - Web framework
- **cors** ^2.8.5 - Cross-origin requests
- **html2pdf.js** ^0.10.1 - HTML PDF conversion (optional, for future features)

All dependencies are lightweight (no browser-like engines).

## License

Part of Pristine Hospital Management System.

## Support

For issues or feature requests:
1. Check Troubleshooting section above
2. Review logs in print-agent console
3. Test health endpoint: `curl http://localhost:9100/health`
4. Check frontend console for error messages

## Version History

### v1.0.0 (Current)
- Initial release
- Support for Windows, macOS, Linux
- Thermal and A4 printer support
- Auto-fallback to browser print
- Health check endpoint

## Future Enhancements

- [ ] Printer queue management
- [ ] Print job history/audit log
- [ ] Network printer discovery (SNMP)
- [ ] Barcode/QR code generation
- [ ] Receipt formatting templates
- [ ] Multi-user permission support
- [ ] Failed print notification via email
- [ ] Integration with hospital EMR system
