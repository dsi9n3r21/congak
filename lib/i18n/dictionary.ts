export type Lang = "ms" | "en" | "both";

export interface Bilingual {
  ms: string;
  en: string;
}

// UI chrome strings used across multiple screens — content-specific text
// (lesson explanations, question prompts, mistake hints) lives alongside
// that content instead (lib/content/topics.ts, lib/questions/, lib/mistakes/).
export const UI: Record<string, Bilingual> = {
  navHome: { ms: "Rumah", en: "Home" },
  navLearn: { ms: "Belajar", en: "Learn" },
  navPractice: { ms: "Latihan", en: "Practice" },
  navQuests: { ms: "Misi", en: "Quests" },
  navProfile: { ms: "Saya", en: "Me" },

  learnTabLearn: { ms: "Belajar", en: "Learn" },
  learnTabTips: { ms: "Tips", en: "Tips" },
  learnTabExample: { ms: "Contoh", en: "Example" },
  learnTabMistakes: { ms: "Kesilapan Lazim", en: "Common Mistakes" },
  startPractice: { ms: "Mula Latihan", en: "Start Practice" },
  startQuiz: { ms: "Mula Kuiz", en: "Start Quiz" },
  answerLabel: { ms: "Jawapan", en: "Answer" },

  checkAnswer: { ms: "Semak Jawapan", en: "Check Answer" },
  correctFeedback: { ms: "Betul! Syabas!", en: "Correct! Well done!" },
  nextQuestion: { ms: "Soalan Seterusnya", en: "Next Question" },
  tryPro: { ms: "Cuba Soalan Serupa", en: "Try a Similar Question" },
  actualAnswer: { ms: "Jawapan sebenar", en: "Correct answer" },
  professorNombor: { ms: "Profesor Nombor", en: "Professor Nombor" },

  quizQuestionOf: { ms: "Soalan", en: "Question" },
  submitQuiz: { ms: "Hantar Kuiz", en: "Submit Quiz" },
  nextArrow: { ms: "Seterusnya", en: "Next" },
  quizScore: { ms: "Betul", en: "Correct" },
  quizAccuracy: { ms: "Ketepatan", en: "Accuracy" },
  quizTime: { ms: "Masa", en: "Time" },
  topicAnalysis: { ms: "Analisis Topik", en: "Topic Analysis" },
  practiceMore: { ms: "Latihan Lagi", en: "More Practice" },
  toDashboard: { ms: "Ke Papan Pemuka", en: "To Dashboard" },

  examMode: { ms: "Mod Peperiksaan", en: "Exam Mode" },
  examTimed: { ms: "Peperiksaan Bertempoh", en: "Timed Exam" },
  chooseTopics: { ms: "Pilih Topik", en: "Choose Topics" },
  chooseDuration: { ms: "Tempoh Masa", en: "Duration" },
  startExam: { ms: "Mula Peperiksaan", en: "Start Exam" },
  strengths: { ms: "Kekuatan", en: "Strengths" },
  needsImprovement: { ms: "Perlu Ditambah Baik", en: "Needs Improvement" },
  recommendedPath: { ms: "Cadangan Pembelajaran", en: "Recommended Path" },

  welcomeBack: { ms: "Selamat kembali,", en: "Welcome back," },
  recommendedToday: { ms: "Cadangan hari ini", en: "Recommended today" },
  continueLearning: { ms: "Sambung belajar", en: "Continue learning" },
  needsAttention: { ms: "Perlu perhatian", en: "Needs attention" },
  examCta: { ms: "Sedia untuk cabaran?", en: "Ready for a challenge?" },
  examCtaSub: { ms: "Cuba Mod Peperiksaan Bertempoh", en: "Try the Timed Exam Mode" },
  linkCode: { ms: "Kod Pautan Ibu Bapa", en: "Parent Link Code" },
  linkCodeShare: { ms: "Kongsi kod ini dengan ibu/bapa anda", en: "Share this code with your parent" },

  logout: { ms: "Log Keluar", en: "Log Out" },
  accessibility: { ms: "Kebolehcapaian", en: "Accessibility" },
  language: { ms: "Bahasa", en: "Language" },

  parentDashboard: { ms: "Papan Pemuka Ibu Bapa", en: "Parent Dashboard" },
  linkChildTitle: { ms: "Pautkan akaun anak", en: "Link your child's account" },
  linkChildSub: { ms: "Minta anak anda kongsi kod 6-aksara dari papan pemuka mereka.", en: "Ask your child for the 6-character code from their dashboard." },
  linkButton: { ms: "Pautkan", en: "Link" },
  noChildrenYet: { ms: "Belum ada anak dipautkan lagi.", en: "No children linked yet." },
  topicsNeedingAttention: { ms: "topik memerlukan perhatian", en: "topics need attention" },
  topicMastery: { ms: "Penguasaan Topik", en: "Topic Mastery" },
  recurringMistakes: { ms: "Kesilapan Berulang", en: "Recurring Mistakes" },
  howToHelp: { ms: "Cara Membantu", en: "How to Help" },
  recentQuizzes: { ms: "Kuiz Terkini", en: "Recent Quizzes" },
  recentExams: { ms: "Peperiksaan Terkini", en: "Recent Exams" },
  reviewMistakes: { ms: "Lihat Kesilapan", en: "Review Mistakes" },
  yourAnswer: { ms: "Jawapan anda", en: "Your answer" },
  correctAnswerLabel: { ms: "Jawapan betul", en: "Correct answer" },
};
