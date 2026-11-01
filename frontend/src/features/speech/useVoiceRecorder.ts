import { useRef, useState, useCallback } from 'react';

export function useVoiceRecorder(onRecordingComplete?: (blob: Blob) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('مرورگر شما از ضبط صدا پشتیبانی نمی‌کند.');
        return;
      }

      // درخواست دسترسی به میکروفون (با استانداردهای وب برای موبایل)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const options = { mimeType: 'audio/webm' };
      // برخی مرورگرهای موبایل (مثل سافاری) از webm پشتیبانی نمی‌کنند
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
        // آزادسازی منابع میکروفون
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('دسترسی به میکروفون رد شد. لطفاً از تنظیمات مرورگر اجازه دهید.');
      } else if (err.name === 'NotFoundError') {
        setError('میکروفونی در دستگاه شما یافت نشد.');
      } else {
        setError('خطا در دسترسی به میکروفون: ' + err.message);
      }
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return { isRecording, error, startRecording, stopRecording };
}