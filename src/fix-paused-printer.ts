/**
 * Fix paused printers - check and enable all printers
 * Useful for troubleshooting or mass-enabling printers
 */

import {
  getAllPrinters,
  getUSBPrinters,
  isPrinterEnabled,
  enablePrinter,
  checkAndResumePrinter,
} from "./print.ts";

async function main() {
  try {
    console.log("🔍 Checking all printers...\n");

    const allPrinters = await getAllPrinters();

    if (allPrinters.length === 0) {
      console.log("❌ No printers found");
      return;
    }

    console.log(`Found ${allPrinters.length} printer(s):\n`);

    for (const printer of allPrinters) {
      console.log(`📄 ${printer.name}`);
      console.log(`   URI: ${printer.uri}`);
      console.log(`   Status: ${printer.status}`);
      console.log(`   USB: ${printer.isUSB ? "Yes" : "No"}`);

      // Check if printer is enabled
      const isEnabled = await isPrinterEnabled(printer.name);

      if (isEnabled) {
        console.log(`   ✅ Printer is ready and accepting jobs`);
      } else {
        console.log(`   ⚠️  Printer is PAUSED/DISABLED`);
        console.log(`   🔧 Attempting to enable...`);

        try {
          await enablePrinter(printer.name);
          console.log(`   ✅ Printer has been ENABLED successfully!`);
        } catch (error) {
          console.log(
            `   ❌ Failed to enable: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      console.log("");
    }

    // Summary for USB printers
    const usbPrinters = await getUSBPrinters();
    if (usbPrinters.length > 0) {
      console.log("\n📊 USB Printer Summary:");
      for (const printer of usbPrinters) {
        const isEnabled = await isPrinterEnabled(printer.name);
        const status = isEnabled ? "✅ Ready" : "⚠️  Paused";
        console.log(`   ${status} - ${printer.name}`);
      }
    }

    console.log("\n💡 Tip: To prevent printers from auto-pausing, run:");
    console.log(
      '   lpadmin -p YourPrinterName -o printer-error-policy=retry-job'
    );
    console.log(
      "\n   See src/PRINTER-PAUSING-GUIDE.md for more information.\n"
    );
  } catch (error) {
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main();

