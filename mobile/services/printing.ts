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
    console.error('Print error:', error);

    // User cancelled print dialog is not really an error
    if (error instanceof Error && error.message.includes('cancel')) {
      return { success: true }; // User cancelled, but not an error
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to print',
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
