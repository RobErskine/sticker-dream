import { pipeline } from '@huggingface/transformers';

// Initialize the transcriber
const transcriber = await pipeline(
  "automatic-speech-recognition",
  "Xenova/whisper-tiny.en"
);

// Get DOM elements
const recordBtn = document.querySelector('.record') as HTMLButtonElement;
const transcriptDiv = document.querySelector('.transcript') as HTMLDivElement;
const audioElement = document.querySelector('#audio') as HTMLAudioElement;
const imageDisplay = document.querySelector('.image-display') as HTMLImageElement;

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

// Check for microphone access before showing the button
async function checkMicrophoneAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop the stream immediately, we just needed to check permission
    stream.getTracks().forEach(track => track.stop());

    // Show the record button
    recordBtn.style.display = 'block';
    transcriptDiv.textContent = 'Ready to record!';
  } catch (error) {
    console.error('Microphone access denied:', error);
    transcriptDiv.textContent = '❌ Microphone access required. Please enable microphone permissions in your browser settings.';
    recordBtn.style.display = 'none';
  }
}

// Check microphone access on load
checkMicrophoneAccess();

// Start recording when button is pressed down
recordBtn.addEventListener('pointerdown', async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    // Create audio blob and URL
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    audioElement.src = audioUrl;

    // Transcribe
    transcriptDiv.textContent = 'Transcribing...';
    const output = await transcriber(audioUrl);
    const text = Array.isArray(output) ? output[0].text : output.text;
    transcriptDiv.textContent = text;

    console.log(output);

    // Automatically generate and print
    await generateAndPrint(text);
  };

  mediaRecorder.start();
  recordBtn.textContent = 'Recording...';
  recordBtn.style.background = 'red';
  recordBtn.style.color = 'white';
});

// Stop recording when button is released
recordBtn.addEventListener('pointerup', () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    recordBtn.textContent = 'Record';
    recordBtn.style.background = '';
    recordBtn.style.color = '';
  }
});

// Also stop if pointer leaves the button while held
recordBtn.addEventListener('pointerleave', () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    recordBtn.textContent = 'Record';
    recordBtn.style.background = '';
    recordBtn.style.color = '';
  }
});

// Generate and print image from transcript
async function generateAndPrint(prompt: string) {
  if (!prompt || prompt === 'Transcribing...') {
    console.error('No valid prompt to generate');
    return;
  }

  try {
    transcriptDiv.textContent = `${prompt}\n\nGenerating & Printing...`;

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    // Display the image
    imageDisplay.src = imageUrl;
    imageDisplay.style.display = 'block';

    transcriptDiv.textContent = prompt;
    console.log('✅ Image generated and printed!');

  } catch (error) {
    console.error('Error:', error);
    transcriptDiv.textContent = `${prompt}\n\nError: Failed to generate image`;
    alert('Failed to generate image: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
