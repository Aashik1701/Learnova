import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Video, VideoOff, Eye } from "lucide-react";

interface ProctorCameraProps {
  isActive?: boolean;
  onStreamReady?: () => void;
}

const ProctorCamera = ({ isActive = true, onStreamReady }: ProctorCameraProps) => {
  type CameraPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<CameraPermissionState | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isSecure = typeof window !== 'undefined' ? window.isSecureContext : true;

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startStream = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(err => console.error("Video play error:", err));
      }
      setIsStreaming(true);
      setError(null);
      onStreamReady?.();
    } catch (err: unknown) {
      console.error("Camera access error:", err);

      // Fallback to simple constraint if the preferred ones fail
      const errName = (err as { name?: string })?.name;
      const errMessage = (err as { message?: string })?.message;
      if (errName === "OverconstrainedError" || errName === "ConstraintNotSatisfiedError") {
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = fallback;
          if (videoRef.current) {
            videoRef.current.srcObject = fallback;
            await videoRef.current.play().catch(e => console.error("Video play error:", e));
          }
          setIsStreaming(true);
          setError(null);
          onStreamReady?.();
          return;
        } catch (e) {
          console.error("Fallback getUserMedia failed:", e);
        }
      }

      if (errName === "NotAllowedError" || errName === "SecurityError") {
        setPermission("denied");
        setError("Permission denied. Please allow camera access in your browser settings.");
      } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
        setError("No camera found. Please connect a webcam or check your device settings.");
      } else {
        setError("Unable to access camera. " + (errMessage || ""));
      }
      setIsStreaming(false);
    }
  }, [onStreamReady]);

  useEffect(() => {
    if (!isActive) {
      // Stop stream when inactive
      stopStream();
      setIsStreaming(false);
      return;
    }

    const usingLocalhost = typeof window !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    if (!isSecure && !usingLocalhost) {
      setError("Camera requires HTTPS or localhost. Open this app via https:// or http://localhost:8080.");
      setIsStreaming(false);
      return;
    }

    // Try to read permission state if available
    if (navigator.permissions?.query) {
  // Some browsers (Safari) may not support 'camera' in permissions API
      navigator.permissions.query({ name: 'camera' }).then((status: PermissionStatus) => {
        setPermission(status.state as PermissionState as CameraPermissionState);
        status.onchange = () => setPermission(status.state as PermissionState as CameraPermissionState);
      }).catch(() => setPermission("unsupported"));
    } else {
      setPermission("unsupported");
    }

    startStream();

    // Cleanup on unmount
    return () => {
      stopStream();
    };
  }, [isActive, isSecure, startStream]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-md rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl bg-slate-800"
    >
      {/* Video feed */}
      <div className="relative aspect-video bg-slate-900">
        {/* Insecure context warning */}
        {!isSecure && (
          <div className="absolute inset-x-0 top-0 z-10 m-3 rounded-lg bg-amber-500/20 border border-amber-400/40 p-3 text-amber-200 text-xs">
            Camera access is blocked on insecure origins. Use localhost or HTTPS.
          </div>
        )}
        {isStreaming ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={(e) => {
                // Ensure video plays when metadata is loaded
                const video = e.currentTarget;
                video.play().catch(err => console.error("Video play error:", err));
              }}
            />
            
            {/* Recording indicator */}
            <motion.div
              className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              RECORDING
            </motion.div>

            {/* AI Proctor Active Badge */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-cyan-500/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold"
            >
              <Eye className="h-3 w-3" />
              AI PROCTOR ACTIVE
            </motion.div>

            {/* Face detection overlay (simulated) */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <div className="absolute inset-12 border-2 border-green-400 rounded-lg" />
              <div className="absolute top-14 left-14 px-2 py-1 bg-green-400/80 text-white text-[10px] font-semibold rounded">
                FACE DETECTED
              </div>
            </motion.div>
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
            <VideoOff className="h-12 w-12 text-red-400 mb-3" />
            <p className="text-red-400 text-sm font-medium mb-2">Camera Unavailable</p>
            <p className="text-gray-400 text-xs max-w-sm">{error}</p>
            {permission === 'denied' && (
              <div className="text-[11px] text-gray-400 max-w-sm">
                Tips:
                <ul className="list-disc list-inside mt-1 text-left">
                  <li>Chrome: Click the camera icon in the address bar and select Allow.</li>
                  <li>Safari: Safari → Settings for This Website → Camera → Allow.</li>
                  <li>Firefox: Check the camera icon/permissions panel and Allow.</li>
                </ul>
              </div>
            )}
            {!isSecure && (
              <div className="text-[11px] text-gray-400 max-w-sm">
                You're not on a secure origin. Use localhost or enable HTTPS.
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => startStream()}
                className="px-3 py-1.5 rounded-md bg-cyan-600 text-white text-xs hover:bg-cyan-500"
              >
                Retry access
              </button>
              <a
                href="http://localhost:8080/quiz-proctor"
                className="px-3 py-1.5 rounded-md bg-slate-700 text-white text-xs hover:bg-slate-600"
              >
                Open on localhost
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Video className="h-12 w-12 text-cyan-400 mb-3 animate-pulse" />
            <p className="text-gray-300 text-sm font-medium">Initializing camera...</p>
            <button
              onClick={() => startStream()}
              className="mt-3 px-3 py-1.5 rounded-md bg-cyan-600 text-white text-xs hover:bg-cyan-500"
            >
              Start camera
            </button>
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      <div className="bg-slate-800/90 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-t border-slate-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-400' : 'bg-gray-400'} animate-pulse`} />
          <span className="text-xs text-gray-300">
            {isStreaming ? 'Live Monitor' : 'Offline'}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          Encrypted • Secure
        </span>
      </div>
    </motion.div>
  );
};

export default ProctorCamera;