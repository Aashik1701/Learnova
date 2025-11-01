import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, AlertTriangle, Clock, Award } from "lucide-react";
import ProctorCamera from "@/components/proctor/ProctorCamera";
import ProctorAlerts from "@/components/proctor/ProctorAlerts";
import IntegrityReport from "@/components/proctor/IntegrityReport";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Which data structure uses LIFO (Last In First Out)?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What does 'AI' stand for?",
    options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Integration", "Algorithmic Iteration"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "Which programming paradigm focuses on functions?",
    options: ["Object-Oriented", "Procedural", "Functional", "Declarative"],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "What is the main purpose of a blockchain?",
    options: ["Store data centrally", "Encrypt passwords", "Distribute and verify transactions", "Speed up computations"],
    correctAnswer: 2
  }
];

type TestPhase = "init" | "consent" | "testing" | "completed";

const QuizProctor = () => {
  const [phase, setPhase] = useState<TestPhase>("init");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(SAMPLE_QUESTIONS.length).fill(null)
  );
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [cameraReady, setCameraReady] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / SAMPLE_QUESTIONS.length) * 100;

  // Timer
  useEffect(() => {
    if (phase !== "testing") return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setPhase("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setPhase("completed");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === SAMPLE_QUESTIONS[index].correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: SAMPLE_QUESTIONS.length,
      percentage: Math.round((correct / SAMPLE_QUESTIONS.length) * 100)
    };
  };

  // Init Screen
  if (phase === "init") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="bg-slate-800/90 backdrop-blur-lg border-slate-700 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="h-10 w-10 text-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-4">
              AI Proctored Assessment
            </h1>
            <p className="text-gray-400 mb-8">
              This test uses advanced AI monitoring to ensure integrity. Your camera will be activated and monitored throughout the assessment.
            </p>

            <div className="bg-slate-900/50 rounded-xl p-6 mb-8 text-left space-y-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                Test Details
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span className="font-semibold">{SAMPLE_QUESTIONS.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">10 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Passing Score:</span>
                  <span className="font-semibold">70%</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setPhase("consent")}
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 text-white font-semibold"
            >
              Begin Test
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Consent & Camera Setup
  if (phase === "consent") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          <Card className="bg-slate-800/90 backdrop-blur-lg border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Camera & Privacy Consent</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  Proctoring Requirements
                </h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Camera must remain on throughout the test</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Ensure good lighting and face visibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Stay in frame and avoid distractions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Do not switch tabs or leave the window</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">Camera Preview</h3>
                <ProctorCamera 
                  isActive={true}
                  onStreamReady={() => setCameraReady(true)}
                />
                {cameraReady && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-green-400 mt-3 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Camera ready
                  </motion.p>
                )}
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-400 text-sm">
                <strong>Privacy Notice:</strong> Video feed is analyzed in real-time by AI. Data is encrypted and deleted after test completion.
              </p>
            </div>

            <Button
              onClick={() => setPhase("testing")}
              disabled={!cameraReady}
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 text-white font-semibold disabled:opacity-50"
            >
              {cameraReady ? "I Agree - Start Test" : "Waiting for camera..."}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Test in Progress
  if (phase === "testing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-slate-800/90 backdrop-blur-lg border border-slate-700 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="h-6 w-6 text-cyan-400" />
              <div>
                <h1 className="text-lg font-bold text-white">AI Proctored Test</h1>
                <p className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {SAMPLE_QUESTIONS.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-400">Time Remaining</div>
                <div className={`text-xl font-bold ${timeRemaining < 60 ? 'text-red-400' : 'text-cyan-400'} flex items-center gap-2`}>
                  <Clock className="h-5 w-5" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Test Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress */}
              <Card className="bg-slate-800/90 backdrop-blur-lg border-slate-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-semibold text-cyan-400">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </Card>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-slate-800/90 backdrop-blur-lg border-slate-700 p-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">
                      {currentQuestion.question}
                    </h2>

                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleAnswer(index)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-4 rounded-xl text-left transition-all ${
                            selectedAnswers[currentQuestionIndex] === index
                              ? 'bg-cyan-600 text-white border-2 border-cyan-400'
                              : 'bg-slate-700/50 text-gray-300 border-2 border-slate-600 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                        </motion.button>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex gap-4">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="flex-1 bg-slate-700 border-slate-600 hover:bg-slate-600"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700"
                >
                  {currentQuestionIndex === SAMPLE_QUESTIONS.length - 1 ? 'Submit Test' : 'Next'}
                </Button>
              </div>
            </div>

            {/* Proctor Sidebar */}
            <div className="space-y-6">
              <Card className="bg-slate-800/90 backdrop-blur-lg border-slate-700 p-4">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  AI Monitoring
                </h3>
                <ProctorCamera isActive={true} />
              </Card>

              <Card className="bg-slate-800/90 backdrop-blur-lg border-slate-700 p-4">
                <ProctorAlerts 
                  isActive={true}
                  onAlert={() => setAlertCount(prev => prev + 1)}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test Completed - Show Results
  const score = calculateScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
      <div className="max-w-5xl w-full space-y-8">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/90 backdrop-blur-lg border-2 border-slate-700 rounded-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Award className="h-12 w-12 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">Test Completed!</h2>
          <p className="text-gray-400 mb-8">Your results have been processed</p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/50 rounded-xl p-6">
              <div className="text-4xl font-bold text-cyan-400 mb-2">{score.percentage}%</div>
              <div className="text-sm text-gray-400">Score</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-6">
              <div className="text-4xl font-bold text-green-400 mb-2">{score.correct}/{score.total}</div>
              <div className="text-sm text-gray-400">Correct Answers</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-6">
              <div className="text-4xl font-bold text-violet-400 mb-2">{alertCount}</div>
              <div className="text-sm text-gray-400">AI Flags</div>
            </div>
          </div>

          <Button
            onClick={() => window.location.reload()}
            size="lg"
            className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700"
          >
            Take Another Test
          </Button>
        </motion.div>

        {/* Integrity Report */}
        <IntegrityReport 
          testDuration={600 - timeRemaining}
          testName="AI Proctored Assessment"
        />
      </div>
    </div>
  );
};

export default QuizProctor;