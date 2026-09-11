import { PrismaClient, PublishStatus } from "@prisma/client";

const db = new PrismaClient();
const ownerEmail = process.env.OWNER_EMAIL ?? "owner@example.com";

async function main() {
  const user = await db.user.upsert({
    where: { email: ownerEmail },
    update: { name: "Shaik Mohammad Hussain", role: "OWNER" },
    create: { email: ownerEmail, name: "Shaik Mohammad Hussain", role: "OWNER" },
  });

  await db.profile.upsert({
    where: { userId: user.id },
    update: {
      headline: "Software Engineering Intern Candidate",
      bio: "Motivated Computer Science and Engineering student seeking software engineering opportunities. Skilled in Java, Python, Data Structures and Algorithms, SQL, and Object-Oriented Programming, with an interest in software development and problem solving.",
      location: "Rayachoty, India",
      interests: "Problem solving; learning new technologies",
      workStyle: "Eager to apply technical knowledge, learn from experienced professionals, and contribute to real-world software development projects.",
      published: false,
    },
    create: {
      userId: user.id,
      headline: "Software Engineering Intern Candidate",
      bio: "Motivated Computer Science and Engineering student seeking software engineering opportunities. Skilled in Java, Python, Data Structures and Algorithms, SQL, and Object-Oriented Programming, with an interest in software development and problem solving.",
      location: "Rayachoty, India",
      interests: "Problem solving; learning new technologies",
      workStyle: "Eager to apply technical knowledge, learn from experienced professionals, and contribute to real-world software development projects.",
      published: false,
    },
  });

  const categories = [["Programming", 1], ["Computer Science", 2], ["Web", 3], ["Professional", 4]] as const;
  const categoryIds = new Map<string, string>();
  for (const [name, sortOrder] of categories) {
    const existing = await db.skillCategory.findFirst({ where: { name } });
    const category = existing
      ? await db.skillCategory.update({ where: { id: existing.id }, data: { sortOrder } })
      : await db.skillCategory.create({ data: { name, sortOrder } });
    categoryIds.set(name, category.id);
  }

  const skills = [
    ["Java", "Programming", 70, true, 1], ["Python", "Programming", 70, true, 2],
    ["JavaScript", "Web", 60, true, 3], ["HTML", "Web", 70, false, 4], ["CSS", "Web", 65, false, 5],
    ["Data Structures & Algorithms", "Computer Science", 65, true, 6],
    ["Object-Oriented Programming", "Computer Science", 70, true, 7],
    ["Algorithm Design", "Computer Science", 60, false, 8], ["Version Control", "Professional", 55, false, 9],
    ["Team Collaboration", "Professional", 55, false, 10],
  ] as const;
  for (const [name, category, proficiency, featured, sortOrder] of skills) {
    const categoryId = categoryIds.get(category);
    if (!categoryId) throw new Error(`Missing skill category: ${category}`);
    const existing = await db.skill.findFirst({ where: { userId: user.id, name } });
    if (existing) await db.skill.update({ where: { id: existing.id }, data: { categoryId, proficiency, featured, sortOrder, published: false } });
    else await db.skill.create({ data: { userId: user.id, name, categoryId, proficiency, featured, sortOrder, published: false } });
  }

  const certificates = [
    { title: "Internship Completion Certificate", organization: "InternPe", date: new Date("2026-08-09T00:00:00.000Z"), credentialId: "IP#86079", verificationUrl: "https://internpe.in/verify.html", skills: "Cyber Security" },
    { title: "Generative AI Mastermind", organization: "Outskill", skills: "Generative AI" },
    { title: "Google AI Fundamentals", organization: "Coursera" },
    { title: "Google AI for App Building", organization: "Coursera" },
    { title: "Google AI for Data Analysis", organization: "Coursera" },
    { title: "Data Visualization in Tableau: Create Dashboards and Stories", organization: "Coursera" },
    { title: "Google AI for Research and Insights", organization: "Coursera" },
  ];
  for (const certificate of certificates) {
    const existing = await db.certificate.findFirst({ where: { userId: user.id, title: certificate.title, organization: certificate.organization } });
    if (existing) await db.certificate.update({ where: { id: existing.id }, data: { ...certificate, status: PublishStatus.DRAFT, featured: false } });
    else await db.certificate.create({ data: { userId: user.id, ...certificate, status: PublishStatus.DRAFT, featured: false } });
  }

  const education = {
    degree: "Bachelor of Technology (B.Tech) in Computer Science and Engineering",
    institution: "Mohan Babu University - Tirupati",
    startDate: new Date("2023-06-01T00:00:00.000Z"),
    score: "CGPA 8.17 · VI Semester SGPA 8.56",
    subjects: "Data Structures; Object-Oriented Programming; Database Management Systems; Computer Networks; Cloud Computing; Pattern Recognition Techniques; Computer Vision; Agile and Scrum Practices; Artificial Neural Networks; Cyber Security Essentials; Compiler Design",
    achievements: "VI Semester: 27 / 27 credits completed; SGPA 8.56",
    description: "Current B.Tech student in Computer Science and Engineering.",
  };
  const existingEducation = await db.education.findFirst({ where: { userId: user.id, degree: education.degree, institution: education.institution } });
  if (existingEducation) await db.education.update({ where: { id: existingEducation.id }, data: { ...education, status: PublishStatus.DRAFT, featured: true } });
  else await db.education.create({ data: { userId: user.id, ...education, status: PublishStatus.DRAFT, featured: true } });

  console.log("Seeded source-backed portfolio data as DRAFT for", user.email);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await db.$disconnect(); });
