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
    const [selectedPattern, setSelectedPattern] = useState<RedFlagPattern | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    const quizQuestions = [
        {
            id: 1,
            question: "A caller says they're from your bank and asks for your OTP to 'verify' your account. What should you do?",
            options: [
                { text: "Share the OTP to verify my account", correct: false },
                { text: "Hang up and call the bank's official number myself", correct: true },
            ],
        },
        {
            id: 2,
            question: "You receive a message saying you've won ₹10 Lakhs in a lottery you never entered. What does this mean?",
            options: [
                { text: "I'm lucky! I should claim the prize", correct: false },
                { text: "It's definitely a scam - I never entered any lottery", correct: true },
            ],
        },
        {
            id: 3,
            question: "Someone asks you to scan a QR code to RECEIVE payment. Is this legitimate?",
            options: [
                { text: "Yes, QR codes can receive payments", correct: false },
                { text: "No, you never need to scan QR to receive money - this is a scam", correct: true },
            ],
        },
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high":
                return "bg-red-100 text-red-800 border-red-300";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            default:
                return "bg-blue-100 text-blue-800 border-blue-300";
        }
    };

    const handleQuizAnswer = (questionId: number, isCorrect: boolean) => {
        setQuizAnswers(prev => ({ ...prev, [questionId]: isCorrect }));
    };

    const getQuizScore = () => {
        return Object.values(quizAnswers).filter(Boolean).length;
    };

    if (selectedPattern) {
        return (
            <Card variant="default" className="overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    <button
                        onClick={() => setSelectedPattern(null)}
                        className="text-white/80 hover:text-white mb-2 flex items-center gap-1 text-sm"
                    >
                        ← Back to all patterns
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{selectedPattern.icon}</span>
                        <div>
                            <h2 className="font-bold text-lg">{selectedPattern.title}</h2>
                            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                                {selectedPattern.severity.toUpperCase()} RISK
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Description */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">What is this?</h3>
                        <p className="text-sm text-muted-foreground">{selectedPattern.description}</p>
                    </div>

                    {/* Examples */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Real Examples
                        </h3>
                        <div className="space-y-2">
                            {selectedPattern.examples.map((example, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                                >
                                    <p className="text-sm text-red-800 italic">"{example}"</p>
                                </div>
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
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                            🛡️ Remember: When in doubt, don't act. Verify through official channels first!
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    if (showQuiz) {
        return (
            <Card variant="default" className="overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-green-500 to-teal-500 text-white">
                    <button
                        onClick={() => {
                            setShowQuiz(false);
                            setQuizAnswers({});
                            setQuizSubmitted(false);
                        }}
                        className="text-white/80 hover:text-white mb-2 flex items-center gap-1 text-sm"
                    >
                        ← Back to learning
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Scam Awareness Quiz</h2>
                            <p className="text-sm text-white/80">Test your knowledge</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {quizSubmitted ? (
                        <>
                            {/* Quiz Results */}
                            <div className={`p-4 rounded-xl text-center ${getQuizScore() === quizQuestions.length
                                    ? "bg-green-100 border border-green-300"
                                    : getQuizScore() >= quizQuestions.length / 2
                                        ? "bg-yellow-100 border border-yellow-300"
                                        : "bg-red-100 border border-red-300"
                                }`}>
                                <p className="text-2xl font-bold mb-1">
                                    {getQuizScore()} / {quizQuestions.length}
                                </p>
                                <p className="text-sm">
                                    {getQuizScore() === quizQuestions.length
                                        ? "🎉 Perfect! You're scam-proof!"
                                        : getQuizScore() >= quizQuestions.length / 2
                                            ? "Good job! Keep learning to stay safe."
                                            : "Review the red flags to improve your awareness."}
                                </p>
                            </div>

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
                                                    Correct answer: {q.options.find(o => o.correct)?.text}
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
                                <div key={q.id} className="space-y-2 pb-4 border-b last:border-0">
                                    <p className="text-sm font-medium text-foreground">
                                        {index + 1}. {q.question}
                                    </p>
                                    <div className="space-y-2">
                                        {q.options.map((option, optIndex) => (
                                            <button
                                                key={optIndex}
                                                onClick={() => handleQuizAnswer(q.id, option.correct)}
                                                className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${quizAnswers[q.id] !== undefined
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
                                <Button onClick={() => setQuizSubmitted(true)} className="w-full">
                                    See Results
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </Card>
        );
    }

    return (
        <Card variant="default" className="overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Scam Red Flags</h2>
                        <p className="text-sm text-white/80">Learn to spot scams before they happen</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-red-50 rounded-lg">
                        <p className="text-lg font-bold text-red-600">
                            {redFlagPatterns.filter(p => p.severity === "high").length}
                        </p>
                        <p className="text-xs text-muted-foreground">High Risk</p>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded-lg">
                        <p className="text-lg font-bold text-yellow-600">
                            {redFlagPatterns.filter(p => p.severity === "medium").length}
                        </p>
                        <p className="text-xs text-muted-foreground">Medium</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">
                            {redFlagPatterns.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Patterns</p>
                    </div>
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
                                            variant="outline"
                                            className={`text-xs ${getSeverityColor(pattern.severity)}`}
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
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-foreground">
                        <strong>🔑 Golden Rule:</strong> If someone asks for OTP, password, or money urgently — it's almost always a scam!
                    </p>
                </div>
            </div>
        </Card>
    );
}
