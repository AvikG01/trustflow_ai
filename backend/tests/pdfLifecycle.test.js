const assert = require('assert');
const pdfGeneratorService = require('../src/services/pdf/pdfGeneratorService');
const pdfParse = require('pdf-parse');

const TEST_RESUME = {
  id: 'test-resume-123',
  title: 'Test Resume',
  template: 'modern_clean',
  personalInfo: {
    fullName: 'Test Candidate',
    email: 'test@example.com',
    phone: '+91 9000000000',
    location: 'Bangalore, India',
    linkedin: 'linkedin.com/in/testcandidate',
    github: 'github.com/testcandidate',
    portfolio: 'testcandidate.dev',
  },
  summary: 'Full-stack developer building web applications with React, Next.js, Node.js, and MySQL.',
  skills: ['JavaScript', 'React', 'Next.js', 'Node.js', 'Express', 'MySQL'],
  experience: [
    {
      title: 'Software Developer',
      company: 'TechCorp Solutions',
      startDate: '2023-01',
      endDate: 'Present',
      description: 'Building high-performance enterprise web applications.',
      bulletPoints: ['Engineered microservices backend using Node.js and MySQL.', 'Optimized frontend rendering in React.'],
    },
  ],
  internships: [
    {
      title: 'Full Stack Development Intern',
      company: 'Innovate Labs',
      duration: '6 Months',
      description: 'Built prototype web interfaces and backend API integrations.',
    },
  ],
  projects: [
    {
      title: 'AI Resume Builder',
      technologies: ['Next.js', 'Node.js', 'Gemini AI'],
      description: 'AI-assisted candidate evaluation and PDF generation platform.',
    },
    {
      title: 'E-commerce Platform',
      technologies: ['React', 'Express', 'MySQL'],
      description: 'High concurrency online store with real-time checkout.',
    },
    {
      title: 'Real-Time Chat Application',
      technologies: ['WebSockets', 'Node.js'],
      description: 'Real-time multi-room messaging system.',
    },
  ],
  education: [
    {
      degree: 'B.Tech',
      field: 'Computer Science',
      institution: 'State Institute of Technology',
      year: '2023',
    },
  ],
  certifications: [
    {
      name: 'Oracle Java Foundations',
      issuer: 'Oracle',
      date: '2023',
    },
  ],
};

async function testPdfLifecycle() {
  console.log('--- Starting Resume PDF Lifecycle & Verification Tests ---');

  const templates = ['modern_clean', 'executive_impact', 'creative_minimalist'];

  for (const tpl of templates) {
    console.log(`\nTesting PDF generation for template: ${tpl}...`);
    const pdfBuffer = await pdfGeneratorService.generateResumePDF(TEST_RESUME, tpl);

    // 1. Check Buffer exists & size > 0
    assert.ok(pdfBuffer, `PDF Buffer should not be null for ${tpl}`);
    assert.ok(pdfBuffer.length > 0, `PDF Buffer size should be > 0 for ${tpl}`);

    // 2. Check Magic Header
    const magicHeader = pdfBuffer.toString('utf-8', 0, 5);
    assert.strictEqual(magicHeader, '%PDF-', `Magic header must be %PDF- for ${tpl}`);
    console.log(`  ✓ Magic header validated: ${magicHeader}`);
    console.log(`  ✓ PDF File size: ${pdfBuffer.length} bytes`);

    // 3. Decode hex streams and text operators from PDF stream buffer
    const rawStream = pdfBuffer.toString('utf-8');
    const hexMatches = rawStream.match(/<[0-9a-fA-F]+>/g) || [];
    const decodedStreamText = hexMatches
      .map((hex) => Buffer.from(hex.replace(/[<>]/g, ''), 'hex').toString('utf-8'))
      .join('');

    const fullText = `${rawStream}\n${decodedStreamText}`;

    const requiredPhrases = [
      'Test Candidate',
      'test@example.com',
      'JavaScript',
      'Software Developer',
      'AI Resume Builder',
      'Computer Science',
      'Oracle Java Foundations',
    ];

    for (const phrase of requiredPhrases) {
      assert.ok(
        fullText.includes(phrase),
        `PDF text for template [${tpl}] MUST contain phrase: "${phrase}".`
      );
    }
    console.log(`  ✓ Content Verification Passed for [${tpl}]! Extract verified.`);
  }

  console.log('\n--- ALL PDF LIFECYCLE & CONTENT VERIFICATION TESTS PASSED ---');
}

testPdfLifecycle().catch((err) => {
  console.error('\n❌ PDF Lifecycle Test Failed:', err);
  process.exit(1);
});
