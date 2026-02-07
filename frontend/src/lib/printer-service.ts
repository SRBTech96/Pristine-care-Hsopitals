"use client";

/**
 * Printer Service - Local print agent integration for hospital billing
 * Tries to print via local Node.js print agent on localhost:9100
 * Falls back to browser print if agent unavailable
 */

const PRINT_AGENT_URL = "http://localhost:9100";
const AGENT_HEALTH_CHECK_TIMEOUT = 2000;

export interface PrintOptions {
  html: string;
  printerType?: "thermal" | "a4";
  invoiceNumber?: string;
}

export interface PrintResult {
  success: boolean;
  method: "agent" | "browser";
  message: string;
  error?: string;
}

/**
 * Check if print agent is available
 */
async function isAgentAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AGENT_HEALTH_CHECK_TIMEOUT);

    const response = await fetch(`${PRINT_AGENT_URL}/health`, {
      signal: controller.signal,
      method: "GET",
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Send print job to local print agent
 */
async function printViaAgent(
  html: string,
  printerType: "thermal" | "a4" = "a4"
): Promise<PrintResult> {
  try {
    const response = await fetch(`${PRINT_AGENT_URL}/print`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, printerType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        method: "agent",
        message: `Agent error: ${errorData.error}`,
        error: errorData.error,
      };
    }

    const data = await response.json();
    return {
      success: data.success ?? true,
      method: "agent",
      message: data.message || `Printing to ${printerType} printer...`,
    };
  } catch (err) {
    return {
      success: false,
      method: "agent",
      message: `Agent connection failed: ${String(err)}`,
      error: String(err),
    };
  }
}

/**
 * Fallback to browser print
 */
function printViaBrowser(html: string): PrintResult {
  try {
    const printWindow = window.open("", "", "width=1000,height=800");
    if (!printWindow) {
      return {
        success: false,
        method: "browser",
        message: "Failed to open print window (popup blocked?)",
        error: "Print window blocked",
      };
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);

    return {
      success: true,
      method: "browser",
      message: "Using browser print dialog...",
    };
  } catch (err) {
    return {
      success: false,
      method: "browser",
      message: `Browser print failed: ${String(err)}`,
      error: String(err),
    };
  }
}

/**
 * Main print function - tries agent first, falls back to browser
 */
export async function printInvoice(options: PrintOptions): Promise<PrintResult> {
  const { html, printerType = "a4", invoiceNumber } = options;

  if (!html) {
    return {
      success: false,
      method: "agent",
      message: "No HTML content to print",
      error: "Empty HTML",
    };
  }

  console.log(`[Print] Attempting to print invoice ${invoiceNumber || "unknown"}`);

  // Try local print agent first
  const agentAvailable = await isAgentAvailable();

  if (agentAvailable) {
    console.log("[Print] Agent available, sending print job...");
    const result = await printViaAgent(html, printerType);

    if (result.success) {
      console.log("[Print] Agent print successful:", result.message);
      return result;
    }

    console.warn("[Print] Agent print failed, falling back to browser:", result.error);
  } else {
    console.log("[Print] Agent unavailable, using browser print");
  }

  // Fallback to browser print
  return printViaBrowser(html);
}

/**
 * Get available printers from agent
 */
export async function getAvailablePrinters(): Promise<string[]> {
  try {
    const agentAvailable = await isAgentAvailable();
    if (!agentAvailable) return [];

    const response = await fetch(`${PRINT_AGENT_URL}/printers`);
    if (!response.ok) return [];

    const data = await response.json();
    return data.printers || [];
  } catch (err) {
    console.error("[Print] Failed to fetch printers:", err);
    return [];
  }
}
