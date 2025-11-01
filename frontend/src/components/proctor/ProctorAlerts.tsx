import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Eye, Volume2, RefreshCw } from "lucide-react";

interface Alert {
  id: string;
  message: string;
  type: "warning" | "success" | "info" | "danger";
  icon: React.ReactNode;
}

const ALERT_TEMPLATES = [
  {
    message: "Multiple faces detected",
    type: "warning" as const,
    icon: <AlertTriangle className="h-4 w-4" />,
    probability: 0.15
  },
  {
    message: "User looking away from screen",
    type: "warning" as const,
    icon: <Eye className="h-4 w-4" />,
    probability: 0.20
  },
  {
    message: "Background voice detected",
    type: "warning" as const,
    icon: <Volume2 className="h-4 w-4" />,
    probability: 0.15
  },
  {
    message: "User verified - Face match confirmed",
    type: "success" as const,
    icon: <CheckCircle className="h-4 w-4" />,
    probability: 0.25
  },
  {
    message: "Tab switch detected",
    type: "danger" as const,
    icon: <RefreshCw className="h-4 w-4" />,
    probability: 0.10
  },
  {
    message: "Maintaining focus",
    type: "success" as const,
    icon: <CheckCircle className="h-4 w-4" />,
    probability: 0.15
  }
];

const getAlertStyle = (type: string) => {
  switch (type) {
    case "warning":
      return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    case "success":
      return "bg-green-500/10 border-green-500/30 text-green-400";
    case "danger":
      return "bg-red-500/10 border-red-500/30 text-red-400";
    default:
      return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
  }
};

interface ProctorAlertsProps {
  onAlert?: (alert: Alert) => void;
  isActive?: boolean;
}

const ProctorAlerts = ({ onAlert, isActive = true }: ProctorAlertsProps) => {
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);

  useEffect(() => {
    if (!isActive) return;

    // Initial alert
    const initialAlert: Alert = {
      id: Date.now().toString(),
      message: "AI monitoring initialized",
      type: "info",
      icon: <Eye className="h-4 w-4" />
    };
    setCurrentAlert(initialAlert);
    setAlertHistory([initialAlert]);
    onAlert?.(initialAlert);

    // Generate random alerts based on probability
    const interval = setInterval(() => {
      const random = Math.random();
      let cumulativeProbability = 0;
      
      for (const template of ALERT_TEMPLATES) {
        cumulativeProbability += template.probability;
        if (random <= cumulativeProbability) {
          const newAlert: Alert = {
            id: Date.now().toString(),
            message: template.message,
            type: template.type,
            icon: template.icon
          };
          
          setCurrentAlert(newAlert);
          setAlertHistory(prev => [...prev.slice(-9), newAlert]); // Keep last 10
          onAlert?.(newAlert);
          break;
        }
      }
    }, 5000); // Alert every 5 seconds

    return () => clearInterval(interval);
  }, [isActive, onAlert]);

  return (
    <div className="w-full space-y-4">
      {/* Current Alert Display */}
      <AnimatePresence mode="wait">
        {currentAlert && (
          <motion.div
            key={currentAlert.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 backdrop-blur-sm ${getAlertStyle(currentAlert.type)}`}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {currentAlert.icon}
            </motion.div>
            <span className="text-sm font-medium flex-1">
              {currentAlert.message}
            </span>
            <motion.div
              className="w-2 h-2 rounded-full bg-current"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert History - Compact view */}
      {alertHistory.length > 1 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Activity Log
            </h3>
            <span className="text-xs text-gray-500">
              {alertHistory.length} events
            </span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            {alertHistory.slice().reverse().slice(0, 5).map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-xs text-gray-400 py-1"
              >
                <div className={`${getAlertStyle(alert.type).split(' ')[2]}`}>
                  {alert.icon}
                </div>
                <span className="flex-1 truncate">{alert.message}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProctorAlerts;