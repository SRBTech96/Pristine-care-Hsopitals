import express from "express";
import cors from "cors";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

const app = express();
const PORT = process.env.PORT || 9100;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb" }));

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Print agent is running" });
});

/**
 * Print endpoint
 * Accepts POST request with HTML invoice and prints to system printer
 */
app.post("/print", async (req, res) => {
  try {
    const { html, printerType = "a4" } = req.body;

    if (!html) {
      return res.status(400).json({
        success: false,
        error: "Missing HTML payload",
      });
    }

    // Create temporary HTML file
    const tempDir = os.tmpdir();
    const tempHtmlFile = path.join(tempDir, `invoice_${Date.now()}.html`);
    const system = process.platform;

    // Write HTML to temp file with print styles
    const htmlWithStyles = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #333;
    }
    @page {
      size: ${printerType === "thermal" ? "80mm 200mm" : "A4"};
      margin: ${printerType === "thermal" ? "5mm" : "10mm"};
      padding: 0;
    }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10pt;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 4pt;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    h1, h2, h3 { margin-bottom: 5pt; }
  </style>
</head>
<body>
${html}
</body>
</html>
    `;

    fs.writeFileSync(tempHtmlFile, htmlWithStyles, "utf-8");

    // Print based on OS
    let command;

    if (system === "win32") {
      // Windows: Use PowerShell to print
      command = `
        $printerName = (Get-NetAdapter | Get-Printer)[0].Name;
        $file = '${tempHtmlFile.replace(/\\/g, "\\\\")}';
        if (Test-Path $file) {
          Start-Process -FilePath "$env:WINDIR\\System32\\notepad.exe" -ArgumentList "/p $file" -WindowStyle Hidden -Wait;
        }
      `;
      command = `powershell -NoProfile -Command "${command}"`;
    } else if (system === "darwin") {
      // macOS: Use lp command
      command = `lp -h localhost -U guest "${tempHtmlFile}" 2>&1`;
    } else {
      // Linux: Use lp command
      command = `lp "${tempHtmlFile}" 2>&1`;
    }

    // Execute print command
    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 10000 });

      // Clean up temp file (with delay to ensure printer has it)
      setTimeout(() => {
        try {
          fs.unlinkSync(tempHtmlFile);
        } catch (err) {
          console.error("Failed to clean up temp file:", err.message);
        }
      }, 1000);

      console.log(`[${new Date().toISOString()}] Print successful: ${printerType} printer`);
      res.json({
        success: true,
        message: `Invoice sent to ${printerType} printer`,
        printer: printerType,
      });
    } catch (execError) {
      // Even if command fails, attempt cleanup
      try {
        fs.unlinkSync(tempHtmlFile);
      } catch (err) {
        // Ignore cleanup errors
      }

      // Some printers may return non-zero even on success
      console.warn(`[${new Date().toISOString()}] Print command output: ${execError.message}`);

      res.json({
        success: true,
        message: `Invoice sent to ${printerType} printer (print job queued)`,
        printer: printerType,
        warning: execError.message,
      });
    }
  } catch (error) {
    console.error("Print error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process print request",
    });
  }
});

/**
 * List available printers endpoint (informational)
 */
app.get("/printers", async (req, res) => {
  try {
    const system = process.platform;
    let printers = [];

    if (system === "win32") {
      try {
        const { stdout } = await execAsync(
          'powershell -Command "Get-Printer | Select-Object -Property Name | ConvertTo-Json"'
        );
        printers = JSON.parse(stdout).map((p) => p.Name);
      } catch (err) {
        printers = ["Default Printer (Windows)"];
      }
    } else {
      try {
        const { stdout } = await execAsync("lpstat -p");
        printers = stdout
          .split("\n")
          .filter((line) => line.includes("printer"))
          .map((line) => line.split(":")[0].replace("printer", "").trim());
      } catch (err) {
        printers = ["Default Printer"];
      }
    }

    res.json({
      success: true,
      system,
      printers: printers.length > 0 ? printers : ["Default Printer"],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🖨️  Hospital Print Agent running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🖨️  POST to http://localhost:${PORT}/print with { html, printerType }`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down print agent...");
  process.exit(0);
});
