import * as Print from 'expo-print';

export interface PrintResult {
  success: boolean;
  error?: string;
}

export async function printImage(base64Data: string): Promise<PrintResult> {
  try {
    // Create HTML with the image for printing
    // We use a full-page image that fits the print area
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page {
              size: 4in 6in;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              background: white;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="data:image/png;base64,${base64Data}" />
        </body>
      </html>
    `;

    // This opens the iOS print dialog
    await Print.printAsync({
      html,
      // Orientation will be handled by the aspect ratio in HTML
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('Print not completed:', errorMessage);

    // User cancelled or dismissed print dialog - not an error
    if (errorMessage.includes('cancel') || errorMessage.includes('did not complete')) {
      return {
        success: false,
        error: 'cancelled',
      };
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function sharePrintImage(base64Data: string): Promise<void> {
  // Alternative: Generate a PDF that can be shared
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @page { size: 4in 6in; margin: 0; }
          body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
          img { max-width: 100%; max-height: 100%; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="data:image/png;base64,${base64Data}" />
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  return uri as unknown as void; // Returns the PDF URI for sharing
}
