const fs = require("node:fs");
const path = require("node:path");

const file = path.join(process.cwd(), "prisma", "schema.prisma");
let schema = fs.readFileSync(file, "utf8");
const enums = [
  ["UserRole", ["OWNER", "ADMIN"]],
  ["MediaType", ["IMAGE", "VIDEO"]],
  ["GoalCategory", ["CAREER", "SKILL", "PROJECT", "AMBITION"]],
  ["Visibility", ["PUBLIC", "PRIVATE"]],
  ["AttendanceStatus", ["PRESENT", "ABSENT"]],
  ["PublishStatus", ["DRAFT", "PREVIEW", "PUBLISHED"]],
];
for (const [name, values] of enums) {
  const compact = new RegExp(`enum ${name} \\{[^}]*\\}`, "m");
  const expanded = `enum ${name} {\n${values.map((value) => `  ${value}`).join("\n")}\n}`;
  schema = schema.replace(compact, expanded);
}
fs.writeFileSync(file, schema);
