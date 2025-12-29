// ============================================================================
// FILE: src/data/mockData.js
// PURPOSE: Mock data for development (will be replaced with Supabase later)
// DESCRIPTION: Contains fake data for careers, skills, resources, and quizzes
// ============================================================================

// Available career paths
export const MOCK_CAREERS = [
  { 
    career_id: 1, 
    career_name: 'Data Scientist', 
    description: 'Analyze data and build machine learning models to solve business problems' 
  },
  { 
    career_id: 2, 
    career_name: 'Web Developer', 
    description: 'Build responsive websites and web applications using modern frameworks' 
  },
  { 
    career_id: 3, 
    career_name: 'Mobile App Developer', 
    description: 'Create iOS and Android applications for smartphones and tablets' 
  },
  { 
    career_id: 4, 
    career_name: 'Cybersecurity Analyst', 
    description: 'Protect systems and networks from security threats and attacks' 
  },
  { 
    career_id: 5, 
    career_name: 'Cloud Engineer', 
    description: 'Design and manage cloud infrastructure on AWS, Azure, or GCP' 
  }
];

// Skills organized by career_id with sequential order
// Each career has a roadmap of skills to learn in a specific sequence
export const MOCK_SKILLS = {
  1: [ // Data Scientist skills
    { 
      skill_id: 1, 
      skill_name: 'Python Programming', 
      skill_category: 'Programming', 
      order: 1,
      description: 'Learn Python syntax, data structures, and basic programming concepts'
    },
    { 
      skill_id: 2, 
      skill_name: 'Statistics & Probability', 
      skill_category: 'Mathematics', 
      order: 2,
      description: 'Understand statistical concepts and probability theory'
    },
    { 
      skill_id: 3, 
      skill_name: 'Data Manipulation with Pandas', 
      skill_category: 'Data Science', 
      order: 3,
      description: 'Master data cleaning, transformation, and analysis using Pandas'
    },
    { 
      skill_id: 4, 
      skill_name: 'Data Visualization', 
      skill_category: 'Data Science', 
      order: 4,
      description: 'Create compelling visualizations using Matplotlib and Seaborn'
    },
    { 
      skill_id: 5, 
      skill_name: 'Machine Learning Basics', 
      skill_category: 'AI/ML', 
      order: 5,
      description: 'Learn supervised and unsupervised learning algorithms'
    },
    { 
      skill_id: 6, 
      skill_name: 'Deep Learning Fundamentals', 
      skill_category: 'AI/ML', 
      order: 6,
      description: 'Understand neural networks and deep learning frameworks'
    }
  ],
  2: [ // Web Developer skills
    { 
      skill_id: 7, 
      skill_name: 'HTML & CSS', 
      skill_category: 'Web Development', 
      order: 1,
      description: 'Build the structure and style of web pages'
    },
    { 
      skill_id: 8, 
      skill_name: 'JavaScript Fundamentals', 
      skill_category: 'Programming', 
      order: 2,
      description: 'Learn JavaScript syntax, DOM manipulation, and ES6+ features'
    },
    { 
      skill_id: 9, 
      skill_name: 'React.js', 
      skill_category: 'Frontend Framework', 
      order: 3,
      description: 'Build interactive UIs with React components and hooks'
    },
    { 
      skill_id: 10, 
      skill_name: 'Node.js & Express', 
      skill_category: 'Backend', 
      order: 4,
      description: 'Create server-side applications and REST APIs'
    },
    { 
      skill_id: 11, 
      skill_name: 'Database Design (SQL)', 
      skill_category: 'Database', 
      order: 5,
      description: 'Design relational databases and write SQL queries'
    }
  ],
  3: [ // Mobile App Developer skills
    { 
      skill_id: 12, 
      skill_name: 'Mobile UI/UX Principles', 
      skill_category: 'Design', 
      order: 1,
      description: 'Understand mobile app design patterns and user experience'
    },
    { 
      skill_id: 13, 
      skill_name: 'React Native', 
      skill_category: 'Mobile Framework', 
      order: 2,
      description: 'Build cross-platform mobile apps with React Native'
    },
    { 
      skill_id: 14, 
      skill_name: 'Mobile API Integration', 
      skill_category: 'Backend Integration', 
      order: 3,
      description: 'Connect mobile apps to REST APIs and handle data'
    }
  ],
  4: [ // Cybersecurity Analyst skills
    { 
      skill_id: 15, 
      skill_name: 'Networking Fundamentals', 
      skill_category: 'Networking', 
      order: 1,
      description: 'Understand TCP/IP, DNS, firewalls, and network protocols'
    },
    { 
      skill_id: 16, 
      skill_name: 'Linux System Administration', 
      skill_category: 'Operating Systems', 
      order: 2,
      description: 'Manage Linux servers and understand command-line tools'
    },
    { 
      skill_id: 17, 
      skill_name: 'Ethical Hacking', 
      skill_category: 'Security', 
      order: 3,
      description: 'Learn penetration testing and vulnerability assessment'
    }
  ],
  5: [ // Cloud Engineer skills
    { 
      skill_id: 18, 
      skill_name: 'Cloud Computing Basics', 
      skill_category: 'Cloud', 
      order: 1,
      description: 'Understand IaaS, PaaS, SaaS, and cloud service models'
    },
    { 
      skill_id: 19, 
      skill_name: 'AWS Core Services', 
      skill_category: 'Cloud Platform', 
      order: 2,
      description: 'Master EC2, S3, RDS, Lambda, and other AWS services'
    },
    { 
      skill_id: 20, 
      skill_name: 'Infrastructure as Code', 
      skill_category: 'DevOps', 
      order: 3,
      description: 'Automate infrastructure with Terraform and CloudFormation'
    }
  ]
};

// Learning resources for each skill
export const MOCK_RESOURCES = {
  1: [ // Python Programming resources
    { 
      resource_id: 1, 
      title: 'Python for Beginners - Full Course', 
      provider: 'freeCodeCamp (YouTube)', 
      cost_type: 'free', 
      url: 'https://www.youtube.com/watch?v=rfscVS0vtbw' 
    },
    { 
      resource_id: 2, 
      title: 'Python Crash Course Book', 
      provider: 'No Starch Press', 
      cost_type: 'paid', 
      url: 'https://nostarch.com/pythoncrashcourse2e' 
    },
    { 
      resource_id: 3, 
      title: 'Learn Python - Interactive Tutorial', 
      provider: 'LearnPython.org', 
      cost_type: 'free', 
      url: 'https://www.learnpython.org/' 
    }
  ],
  2: [ // Statistics resources
    { 
      resource_id: 4, 
      title: 'Statistics and Probability Course', 
      provider: 'Khan Academy', 
      cost_type: 'free', 
      url: 'https://www.khanacademy.org/math/statistics-probability' 
    },
    { 
      resource_id: 5, 
      title: 'Think Stats - Free Book', 
      provider: 'Green Tea Press', 
      cost_type: 'free', 
      url: 'https://greenteapress.com/thinkstats/' 
    }
  ],
  3: [ // Pandas resources
    { 
      resource_id: 6, 
      title: 'Pandas Tutorial for Beginners', 
      provider: 'Corey Schafer (YouTube)', 
      cost_type: 'free', 
      url: 'https://www.youtube.com/watch?v=ZyhVh-qRZPA' 
    }
  ],
  7: [ // HTML & CSS resources
    { 
      resource_id: 7, 
      title: 'HTML & CSS Full Course', 
      provider: 'freeCodeCamp', 
      cost_type: 'free', 
      url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' 
    },
    { 
      resource_id: 8, 
      title: 'The Odin Project - HTML & CSS', 
      provider: 'The Odin Project', 
      cost_type: 'free', 
      url: 'https://www.theodinproject.com/paths/foundations/courses/foundations' 
    }
  ],
  8: [ // JavaScript resources
    { 
      resource_id: 9, 
      title: 'JavaScript Tutorial for Beginners', 
      provider: 'Programming with Mosh (YouTube)', 
      cost_type: 'free', 
      url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk' 
    }
  ]
};

// Quiz questions for skills
export const MOCK_QUIZZES = {
  1: { // Python quiz
    quiz_id: 1,
    skill_id: 1,
    difficulty: 'easy',
    questions: [
      { 
        question: 'What is a variable in Python?', 
        options: [
          'A container for storing data values', 
          'A function that returns values', 
          'A type of loop', 
          'A Python class'
        ], 
        correct: 0 
      },
      { 
        question: 'Which keyword is used to define a function in Python?', 
        options: ['function', 'def', 'func', 'define'], 
        correct: 1 
      },
      { 
        question: 'What does the print() function do in Python?', 
        options: [
          'Saves data to a file', 
          'Displays output to the console', 
          'Creates a new variable', 
          'None of the above'
        ], 
        correct: 1 
      },
      { 
        question: 'Which data type would you use to store the value True or False?', 
        options: ['string', 'integer', 'boolean', 'float'], 
        correct: 2 
      },
      { 
        question: 'What symbol is used for comments in Python?', 
        options: ['//', '/* */', '#', '<!--'], 
        correct: 2 
      }
    ]
  },
  7: { // HTML & CSS quiz
    quiz_id: 2,
    skill_id: 7,
    difficulty: 'easy',
    questions: [
      { 
        question: 'What does HTML stand for?', 
        options: [
          'Hyper Text Markup Language', 
          'High Tech Modern Language', 
          'Home Tool Markup Language', 
          'Hyperlinks and Text Markup Language'
        ], 
        correct: 0 
      },
      { 
        question: 'Which HTML tag is used to create a hyperlink?', 
        options: ['<link>', '<a>', '<href>', '<url>'], 
        correct: 1 
      },
      { 
        question: 'What does CSS stand for?', 
        options: [
          'Creative Style Sheets', 
          'Cascading Style Sheets', 
          'Computer Style Sheets', 
          'Colorful Style Sheets'
        ], 
        correct: 1 
      }
    ]
  }
};