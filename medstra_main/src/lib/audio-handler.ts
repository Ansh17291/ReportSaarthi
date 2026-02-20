export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private isRecording = false;

    constructor(
        private onStatusChange: (status: string) => void,
        private onTranscriptionComplete: (text: string) => void
    ) {}

    async startRecording() {
        try {
            console.log('Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted');
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.isRecording = true;

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                await this.sendToWhisper(audioBlob);
            };

            this.mediaRecorder.start(1000); // Collect data every second
            this.onStatusChange('Recording... Speak now');
        } catch (error) {
            console.error('Error starting recording:', error);
            this.onStatusChange('Error: ' + (error as Error).message);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.onStatusChange('Processing audio...');
            
            // Stop all tracks in the stream
            const stream = this.mediaRecorder.stream;
            stream.getTracks().forEach(track => track.stop());
        }
    }

    private async sendToWhisper(audioBlob: Blob) {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob);

            const response = await fetch('/api/whisper', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { text } = await response.json();
            this.onStatusChange('');
            this.onTranscriptionComplete(text);
        } catch (error) {
            console.error('Error transcribing audio:', error);
            this.onStatusChange('Error: Failed to transcribe audio');
        }
    }
} 