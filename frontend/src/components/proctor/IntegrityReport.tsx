import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Eye, TrendingUp, Clock, Shield } from "lucide-react";

interface IntegrityReportProps {
  testDuration?: number; // in seconds
  userId?: string;
  testName?: string;
}

interface FlagItem {
  severity: "critical" | "warning" | "info";
  message: string;
  count: number;
  timestamp?: string;
}

const IntegrityReport = ({ 
  testDuration = 3600, 
  userId = "user_12345",
  testName = "AI Proctored Assessment"
}: IntegrityReportProps) => {
  // Simulated data that looks like real AI analysis
  const flags: FlagItem[] = [
    { severity: "warning", message: "Multiple faces detected", count: 2, timestamp: "14:23:15" },
    { severity: "warning", message: "User looked away", count: 4, timestamp: "14:35:42" },
    { severity: "info", message: "Background voice detected", count: 1, timestamp: "14:48:20" },
  ];

  const integrityScore = 0.83; // 83% integrity
  const totalViolations = flags.reduce((sum, flag) => sum + flag.count, 0);
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-400 bg-red-500/10 border-red-500/30";
      case "warning": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      default: return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-5 w-5" />;
      case "warning": return <AlertTriangle className="h-5 w-5" />;
      default: return <Eye className="h-5 w-5" />;
    }
  };

  const getRecommendation = () => {
    if (integrityScore >= 0.9) return { text: "✅ High integrity - No review needed", color: "text-green-400" };
    if (integrityScore >= 0.75) return { text: "⚠️ Review recommended - Medium integrity risk", color: "text-yellow-400" };
    return { text: "🚫 Manual review required - Low integrity", color: "text-red-400" };
  };

  const recommendation = getRecommendation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto bg-slate-800/90 backdrop-blur-lg rounded-2xl border-2 border-slate-700 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-violet-600/20 border-b border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-2 flex items-center gap-3"
            >
              <Shield className="h-7 w-7 text-cyan-400" />
              AI Integrity Report
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-sm"
            >
              {testName} • User ID: {userId}
            </motion.p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-right"
          >
            <div className="text-xs text-gray-400 mb-1">Test Duration</div>
            <div className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Clock className="h-4 w-4" />
              {Math.floor(testDuration / 60)}m {testDuration % 60}s
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Integrity Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/50 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Overall Integrity Score</h3>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${integrityScore >= 0.75 ? 'text-cyan-400' : 'text-yellow-400'}`}>
                  {Math.round(integrityScore * 100)}%
                </span>
                <TrendingUp className={`h-5 w-5 ${integrityScore >= 0.75 ? 'text-green-400' : 'text-yellow-400'}`} />
              </div>
            </div>
            <motion.div
              className="relative w-24 h-24"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-700"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className={integrityScore >= 0.75 ? 'text-cyan-400' : 'text-yellow-400'}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: integrityScore }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                  style={{
                    strokeDasharray: "251.2",
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%"
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle className={`h-8 w-8 ${integrityScore >= 0.75 ? 'text-cyan-400' : 'text-yellow-400'}`} />
              </div>
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full ${integrityScore >= 0.75 ? 'bg-gradient-to-r from-cyan-500 to-green-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${integrityScore * 100}%` }}
              transition={{ duration: 1.5, delay: 0.7 }}
            />
          </div>
        </motion.div>

        {/* Detected Issues */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            Detected Issues ({totalViolations})
          </h3>
          <div className="space-y-2">
            {flags.map((flag, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityColor(flag.severity)}`}
              >
                <div className="flex items-center gap-3">
                  {getSeverityIcon(flag.severity)}
                  <div>
                    <span className="text-sm font-medium">{flag.message}</span>
                    {flag.timestamp && (
                      <span className="text-xs text-gray-500 ml-2">at {flag.timestamp}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-current/10 rounded-full">
                    {flag.count}x
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Analysis Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-slate-900/50 rounded-xl p-4 border border-slate-700"
        >
          <h3 className="text-sm font-semibold text-gray-300 mb-3">AI Analysis Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">{flags.length}</div>
              <div className="text-xs text-gray-400">Flag Types</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{totalViolations}</div>
              <div className="text-xs text-gray-400">Total Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">97%</div>
              <div className="text-xs text-gray-400">Face Detection</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-400">2.1s</div>
              <div className="text-xs text-gray-400">Avg Response</div>
            </div>
          </div>
        </motion.div>

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-xl p-5 border-2 border-slate-600"
        >
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Recommendation</h3>
          <p className={`text-lg font-semibold ${recommendation.color}`}>
            {recommendation.text}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Powered by Learnova AI Vision Engine • Generated at {new Date().toLocaleTimeString()}
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="flex gap-3 pt-2"
        >
          <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Download Report
          </button>
          <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors">
            Share Results
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default IntegrityReport;