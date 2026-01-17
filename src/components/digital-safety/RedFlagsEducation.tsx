import { useState } from "react";
import {
  BookOpen,
  AlertTriangle,
  ChevronRight,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redFlagPatterns, RedFlagPattern } from "@/lib/redFlags";

export function RedFlagsEducation() {
  const [selectedPattern, setSelectedPattern] = useState<RedFlagPattern | null>(
    null,
  );
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question:
        "A caller says they're from your bank and asks for your OTP to 'verify' your account. What should you do?",
      options: [
        { text: "Share the OTP to verify my account", correct: false },
        {
          text: "Hang up and call the bank's official number myself",
          correct: true,
        },
      ],
    },
    {
      id: 2,
      question:
        "You receive a message saying you've won ₹10 Lakhs in a lottery you never entered. What does this mean?",
      options: [
        { text: "I'm lucky! I should claim the prize", correct: false },
        {
          text: "It's definitely a scam - I never entered any lottery",
          correct: true,
        },
      ],
    },
    {
      id: 3,
      question:
        "Someone asks you to scan a QR code to RECEIVE payment. Is this legitimate?",
      options: [
        { text: "Yes, QR codes can receive payments", correct: false },
        {
          text: "No, you never need to scan QR to receive money - this is a scam",
          correct: true,
        },
      ],
    },
  ];

  const handleQuizAnswer = (questionId: number, isCorrect: boolean) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: isCorrect }));
  };

  const getQuizScore = () => {
    return Object.values(quizAnswers).filter(Boolean).length;
  };

  if (selectedPattern) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <Card variant="warning">
          <button
            onClick={() => setSelectedPattern(null)}
            className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 text-sm"
          >
            ← Back to all patterns
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/20 rounded-lg">
              <span className="text-3xl">{selectedPattern.icon}</span>
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">
                {selectedPattern.title}
              </h2>
              <Badge
                variant={
                  selectedPattern.severity === "high"
                    ? "destructive"
                    : selectedPattern.severity === "medium"
                      ? "secondary"
                      : "outline"
                }
              >
                {selectedPattern.severity.toUpperCase()} RISK
              </Badge>
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">What is this?</h3>
            <p className="text-sm text-muted-foreground">
              {selectedPattern.description}
            </p>
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Real Examples
            </h3>
            <div className="space-y-2">
              {selectedPattern.examples.map((example, index) => (
                <Card
                  key={index}
                  variant="destructive"
                  className="bg-destructive/10"
                >
                  <p className="text-sm text-foreground italic">"{example}"</p>
                </Card>
              ))}
            </div>
          </div>

          {/* How to Spot */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              How to Spot This
            </h3>
            <ul className="space-y-2">
              {selectedPattern.howToSpot.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Rule */}
          <Card variant="success" className="bg-success/10">
            <p className="text-sm text-foreground font-medium">
              🛡️ Remember: When in doubt, don't act. Verify through official
              channels first!
            </p>
          </Card>
        </Card>
      </div>
    );
  }

  if (showQuiz) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <Card variant="success">
          <button
            onClick={() => {
              setShowQuiz(false);
              setQuizAnswers({});
              setQuizSubmitted(false);
            }}
            className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 text-sm"
          >
            ← Back to learning
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/20 rounded-lg">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">
                Scam Awareness Quiz
              </h2>
              <p className="text-sm text-muted-foreground">
                Test your knowledge
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          {quizSubmitted ? (
            <>
              {/* Quiz Results */}
              <Card
                variant={
                  getQuizScore() === quizQuestions.length
                    ? "success"
                    : getQuizScore() >= quizQuestions.length / 2
                      ? "warning"
                      : "destructive"
                }
                className="text-center"
              >
                <p className="text-2xl font-bold mb-1 text-foreground">
                  {getQuizScore()} / {quizQuestions.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getQuizScore() === quizQuestions.length
                    ? "🎉 Perfect! You're scam-proof!"
                    : getQuizScore() >= quizQuestions.length / 2
                      ? "Good job! Keep learning to stay safe."
                      : "Review the red flags to improve your awareness."}
                </p>
              </Card>

              {/* Review Answers */}
              {quizQuestions.map((q, index) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {index + 1}. {q.question}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    {quizAnswers[q.id] ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-700">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-700">
                          Correct answer:{" "}
                          {q.options.find((o) => o.correct)?.text}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}

              <Button
                onClick={() => {
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
                className="w-full"
              >
                Try Again
              </Button>
            </>
          ) : (
            <>
              {/* Quiz Questions */}
              {quizQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="space-y-2 pb-4 border-b last:border-0"
                >
                  <p className="text-sm font-medium text-foreground">
                    {index + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        onClick={() => handleQuizAnswer(q.id, option.correct)}
                        className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                          quizAnswers[q.id] !== undefined
                            ? option.correct
                              ? "border-green-500 bg-green-50"
                              : quizAnswers[q.id] === option.correct
                                ? "border-red-500 bg-red-50"
                                : "border-muted"
                            : "border-muted hover:border-primary"
                        }`}
                        disabled={quizAnswers[q.id] !== undefined}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Submit */}
              {Object.keys(quizAnswers).length === quizQuestions.length && (
                <Button
                  onClick={() => setQuizSubmitted(true)}
                  className="w-full"
                >
                  See Results
                </Button>
              )}
            </>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card variant="primary">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">
              Scam Red Flags
            </h2>
            <p className="text-sm text-muted-foreground">
              Learn to spot scams before they happen
            </p>
          </div>
        </div>
      </Card>

      <Card variant="elevated">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <Card variant="destructive" className="bg-destructive/10 p-2">
            <p className="text-lg font-bold text-destructive">
              {redFlagPatterns.filter((p) => p.severity === "high").length}
            </p>
            <p className="text-xs text-muted-foreground">High Risk</p>
          </Card>
          <Card variant="warning" className="bg-warning/10 p-2">
            <p className="text-lg font-bold text-warning">
              {redFlagPatterns.filter((p) => p.severity === "medium").length}
            </p>
            <p className="text-xs text-muted-foreground">Medium</p>
          </Card>
          <Card variant="primary" className="bg-primary/10 p-2">
            <p className="text-lg font-bold text-primary">
              {redFlagPatterns.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Patterns</p>
          </Card>
        </div>

        {/* Take Quiz Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowQuiz(true)}
        >
          <Shield className="w-4 h-4 mr-2" />
          Take Scam Awareness Quiz
        </Button>

        {/* Pattern List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground text-sm">
            Common Scam Patterns
          </h3>
          <div className="space-y-2">
            {redFlagPatterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className="w-full p-3 rounded-lg border hover:border-primary hover:bg-muted/30 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pattern.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {pattern.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {pattern.description.substring(0, 50)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        pattern.severity === "high"
                          ? "destructive"
                          : pattern.severity === "medium"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {pattern.severity}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Key Takeaway */}
        <Card variant="primary" className="bg-primary/10">
          <p className="text-sm text-foreground">
            <strong>🔑 Golden Rule:</strong> If someone asks for OTP, password,
            or money urgently — it's almost always a scam!
          </p>
        </Card>
      </Card>
    </div>
  );
}
