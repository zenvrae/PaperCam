import { Course, Exam, Lesson, Question, CourseReview, User } from '@/types';

export const MOCK_USER: User = {
  id: 1024,
  name: '',
  email: '',
  role: 'student',
  phone: '',
  district: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  created_at: new Date().toISOString()
};

export const MOCK_COURSES: Course[] = [
  {
    id: 1,
    title: 'Kerala PSC LDC Complete Master Course 2026',
    slug: 'kerala-psc-ldc-master-course-2026',
    description: 'Comprehensive preparation program for Lower Division Clerk (LDC) and Junior Assistant exams conducted by Kerala PSC. Includes complete syllabus coverage for Indian Constitution, Kerala History, Mathematics, English Grammar, Malayalam, and Current Affairs with 100+ mock tests and detailed explanations.',
    short_description: 'Master all LDC syllabus topics with 150+ Video Lessons, 50+ Practice PDFs, and 30 Full Length PSC Mock Tests.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    category: 'LDC & Junior Assistant',
    difficulty: 'All Levels',
    language: 'Bilingual',
    price: 1499,
    sale_price: 999,
    is_free: false,
    status: 'published',
    instructor: {
      name: 'Dr. Suresh Kumar',
      title: 'Senior PSC Mentor & Ex-Govt Officer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    },
    duration: '120 Hours',
    certificate_available: true,
    total_students: 4280,
    rating: 4.9,
    reviews_count: 384,
    pdf_count: 45,
    exam_count: 25,
    features: [
      '120 HD Video Lessons',
      '45 Topic-wise Reference PDFs',
      '25 Standard PSC Mock Tests',
      '2,500+ Solved Practice Questions',
      'Detailed Explanations & PSC Related Facts',
      'Unlimited Re-attempts & Leaderboard Access'
    ],
    curriculum: [
      {
        id: 101,
        course_id: 1,
        title: 'Module 1: Indian History & Constitution',
        order: 1,
        lessons: [
          {
            id: 201,
            module_id: 101,
            course_id: 1,
            title: 'Indian Constitution - Fundamental Rights (Articles 12-35)',
            slug: 'fundamental-rights',
            content_type: 'VIDEO_PDF',
            duration: '35 mins',
            is_free_preview: true,
            youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtube_video_id: 'dQw4w9WgXcQ',
            pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            pdf_title: 'Fundamental_Rights_PSC_Notes.pdf',
            description: 'Comprehensive analysis of 6 Fundamental Rights in Indian Constitution, key Supreme Court amendments, landmark judgments, and frequently asked PSC questions.',
            notes: 'Key points to remember: Fundamental Rights were borrowed from the US Bill of Rights. Article 32 is called the Heart and Soul of the Constitution by Dr. B.R. Ambedkar.',
            order: 1
          },
          {
            id: 202,
            module_id: 101,
            course_id: 1,
            title: 'Directive Principles of State Policy (DPSP) & Fundamental Duties',
            slug: 'directive-principles-dpsp',
            content_type: 'VIDEO_PDF',
            duration: '42 mins',
            is_free_preview: true,
            youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtube_video_id: 'dQw4w9WgXcQ',
            pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            pdf_title: 'DPSP_Notes_KeralaPSC.pdf',
            description: 'Study Part IV of Indian Constitution (Articles 36-51) and 42nd Amendment additions.',
            order: 2
          }
        ]
      }
    ]
  }
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 1001,
    question_text: 'Who was the first President of independent India?',
    question_text_ml: 'സ്വതന്ത്ര ഇന്ത്യയുടെ ആദ്യത്തെ രാഷ്ട്രപതി ആരായിരുന്നു?',
    subject: 'Indian History',
    topic: 'Indian Constitution & Freedom Movement',
    difficulty: 'Easy',
    question_type: 'MCQ',
    year: '2024',
    exam_name: 'Kerala PSC LDC 2024',
    options: [
      { id: '1', question_id: 1001, option_code: 'A', option_text: 'Jawaharlal Nehru', option_text_ml: 'ജവഹർലാൽ നെഹ്റു' },
      { id: '2', question_id: 1001, option_code: 'B', option_text: 'Dr. Rajendra Prasad', option_text_ml: 'ഡോ. രാജേന്ദ്ര പ്രസാദ്' },
      { id: '3', question_id: 1001, option_code: 'C', option_text: 'Sardar Vallabhbhai Patel', option_text_ml: 'സർദാർ വല്ലഭ്ഭായി പട്ടേൽ' },
      { id: '4', question_id: 1001, option_code: 'D', option_text: 'Dr. B.R. Ambedkar', option_text_ml: 'ഡോ. ബി.ആർ. അംബേദ്കർ' }
    ],
    correct_answer: 'B',
    explanation: 'Dr. Rajendra Prasad served as the first President of India from January 26, 1950 to May 13, 1962.',
    explanation_ml: '1950 ജനുവരി 26 മുതൽ 1962 മേയ് 13 വരെ ഡോ. രാജേന്ദ്ര പ്രസാദ് സ്വതന്ത്ര ഇന്ത്യയുടെ ആദ്യ രാഷ്ട്രപതിയായി സേവനമനുഷ്ഠിച്ചു.',
    related_facts: [
      'Dr. Rajendra Prasad is the longest-serving President of India (over 12 years).',
      'He was elected President of the Constituent Assembly in December 1946.',
      'He was awarded the Bharat Ratna in 1962.'
    ],
    source: 'NCERT / Indian Constitution & Freedom Movement',
    is_bookmarked: true
  },
  {
    id: 1002,
    question_text: 'Which Article of the Indian Constitution is known as the "Heart and Soul of the Constitution"?',
    question_text_ml: 'ഇന്ത്യൻ ഭരണഘടനയുടെ "ഹൃദയവും ആത്മാവും" എന്ന് വിശേഷിപ്പിക്കപ്പെടുന്ന അനുച്ഛേദം (Article) ഏതാണ്?',
    subject: 'Indian Constitution',
    topic: 'Fundamental Rights',
    difficulty: 'Medium',
    question_type: 'MCQ',
    year: '2023',
    exam_name: 'Kerala PSC Degree Level Prelims',
    options: [
      { id: '5', question_id: 1002, option_code: 'A', option_text: 'Article 14', option_text_ml: 'അനുച്ഛേദം 14' },
      { id: '6', question_id: 1002, option_code: 'B', option_text: 'Article 19', option_text_ml: 'അനുച്ഛേദം 19' },
      { id: '7', question_id: 1002, option_code: 'C', option_text: 'Article 21', option_text_ml: 'അനുച്ഛേദം 21' },
      { id: '8', question_id: 1002, option_code: 'D', option_text: 'Article 32', option_text_ml: 'അനുച്ഛേദം 32' }
    ],
    correct_answer: 'D',
    explanation: 'Dr. B.R. Ambedkar described Article 32 (Right to Constitutional Remedies) as the heart and soul of the Constitution.',
    explanation_ml: 'ഡോ. ബി.ആർ. അംബേദ്കർ അനുച്ഛേദം 32 നെ (ഭരണഘടനാപരമായ പരിഹാരം കാണാനുള്ള അവകാശം) ഭരണഘടനയുടെ ഹൃദയവും ആത്മാവും എന്ന് വിശേഷിപ്പിച്ചു.',
    related_facts: [
      'Article 32 empowers citizens to move the Supreme Court directly for enforcement of Fundamental Rights.',
      'Under Article 32, the Supreme Court can issue 5 types of Writs.',
      'Article 226 gives similar writ powers to State High Courts.'
    ],
    source: 'Constituent Assembly Debates',
    is_bookmarked: false
  },
  {
    id: 1003,
    question_text: 'The famous Vaikom Satyagraha took place in which year?',
    question_text_ml: 'പ്രസിദ്ധമായ വൈക്കം സത്യാഗ്രഹം നടന്ന വർഷം ഏതാണ്?',
    subject: 'Kerala History',
    topic: 'Renaissance Leaders & Movements',
    difficulty: 'Easy',
    question_type: 'MCQ',
    year: '2024',
    exam_name: 'Kerala PSC LDC',
    options: [
      { id: '9', question_id: 1003, option_code: 'A', option_text: '1921', option_text_ml: '1921' },
      { id: '10', question_id: 1003, option_code: 'B', option_text: '1924', option_text_ml: '1924' },
      { id: '11', question_id: 1003, option_code: 'C', option_text: '1931', option_text_ml: '1931' },
      { id: '12', question_id: 1003, option_code: 'D', option_text: '1936', option_text_ml: '1936' }
    ],
    correct_answer: 'B',
    explanation: 'Vaikom Satyagraha was a non-violent movement in Travancore, Kerala launched on March 30, 1924.',
    explanation_ml: '1924 മാർച്ച് 30 നാണ് തിരുവിതാംകൂറിൽ ക്ഷേത്ര റോഡുകളിലേക്ക് പ്രവേശനാനുമതിക്കായി ചരിത്രപരമായ വൈക്കം സത്യാഗ്രഹം ആരംഭിച്ചത്.',
    related_facts: [
      'Mahatma Gandhi visited Vaikom in March 1925 during the Satyagraha.',
      'E.V. Ramasamy (Periyar) participated actively and was honored as "Vaikom Veeran".'
    ],
    source: 'Kerala History Gazetteers',
    is_bookmarked: true
  },
  {
    id: 1004,
    question_text: 'What is the sum of first 50 natural numbers?',
    question_text_ml: 'ആദ്യത്തെ 50 എണ്ണൽ സംഖ്യകളുടെ തുക എത്രയാണ്?',
    subject: 'Mathematics',
    topic: 'Number Systems',
    difficulty: 'Medium',
    question_type: 'MCQ',
    year: '2023',
    exam_name: 'Kerala PSC LDC 2023',
    options: [
      { id: '13', question_id: 1004, option_code: 'A', option_text: '1225', option_text_ml: '1225' },
      { id: '14', question_id: 1004, option_code: 'B', option_text: '1275', option_text_ml: '1275' },
      { id: '15', question_id: 1004, option_code: 'C', option_text: '1300', option_text_ml: '1300' },
      { id: '16', question_id: 1004, option_code: 'D', option_text: '1350', option_text_ml: '1350' }
    ],
    correct_answer: 'B',
    explanation: 'Formula S = n(n+1)/2. For n=50: S = 50 * 51 / 2 = 1275.',
    explanation_ml: 'തുക കാണാനുള്ള സൂത്രവാക്യം S = n(n+1)/2 ആണ്. n=50 ആകുമ്പോൾ S = 50 * 51 / 2 = 1275.',
    related_facts: [
      'Sum of first n even numbers = n(n+1)',
      'Sum of first n odd numbers = n^2'
    ],
    source: 'Kerala PSC Maths PYQs'
  }
];

export const MOCK_EXAMS: Exam[] = [
  {
    id: 1,
    title: 'Kerala PSC LDC Full Mock Test #1',
    description: 'Official 100-mark mock examination for LDC 2024 with negative marking (-0.33) and bilingual question prompts.',
    duration_minutes: 75,
    total_questions: 4,
    marks_per_question: 1,
    negative_marks: 0.33,
    passing_score_percent: 40,
    subject_category: 'LDC Full Mock',
    is_full_mock: true,
    questions: MOCK_QUESTIONS
  }
];
