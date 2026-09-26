import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { loc } from "../src/lib/i18n/localized";
import { seedAdmin, seedContent } from "../src/lib/seed";

// QA data set (test plan §4): the production seed (so the public pages can be
// compared with the dictionary) plus the extra records the suites rely on.
// Runs against DATABASE_URL, which tests/env.mjs points at the test database.

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const json = (v: unknown) => v as Prisma.InputJsonValue;
const day = (offset: number, hour = 10) => {
  const d = new Date("2026-09-01T00:00:00+04:00");
  d.setDate(d.getDate() + offset);
  d.setHours(hour);
  return d;
};

async function main() {
  await seedAdmin(prisma, { email: process.env.ADMIN_EMAIL ?? "qa@nobug.az", password: process.env.ADMIN_PASSWORD ?? "qa-password-2026", name: process.env.ADMIN_NAME });
  await seedContent(prisma);

  // hero: every language filled (seedContent does this); 3 partner logos
  await prisma.partnerLogo.deleteMany();
  await prisma.partnerLogo.createMany({
    data: ["Alpha", "Beta", "Gamma"].map((name, order) => ({ name, logoUrl: "/assets/logo-navy-amber.svg", logoPath: null, url: order === 0 ? "https://example.com" : "", order, isActive: true })),
  });

  // projects: seed has 2 (first featured) → add 3 more: featured, unpublished, az-only
  const extra = [
    { slug: "test-secilmis-layihe", title: loc("Seçilmiş test layihəsi", "Featured test project", "Избранный тестовый проект"), shortDescription: loc("İkinci seçilmiş layihə.", "Second featured project.", "Второй избранный проект."), content: loc("<p>Məzmun</p>", "<p>Content</p>", "<p>Контент</p>"), year: "2025", duration: "2 ay", isFeatured: true, isPublished: true, order: 2 },
    { slug: "qaralama-layihe", title: loc("Qaralama layihə", "Draft project", "Черновик проекта"), shortDescription: loc("Dərc olunmayıb.", "Unpublished.", "Не опубликован."), content: loc("<p>Gizli</p>", "", ""), year: "2024", duration: "", isFeatured: false, isPublished: false, order: 3 },
    { slug: "yalniz-az-layihe", title: loc("Yalnız AZ layihə", "", ""), shortDescription: loc("Bu layihənin yalnız Azərbaycan dili var.", "", ""), content: loc("<p>Yalnız AZ</p>", "", ""), year: "2023", duration: "1 ay", isFeatured: false, isPublished: true, order: 4 },
  ];
  for (const { slug, ...p } of extra) {
    const data = { ...p, title: json(p.title), shortDescription: json(p.shortDescription), content: json(p.content) };
    await prisma.project.upsert({ where: { slug }, create: { slug, ...data }, update: data });
  }

  // services: one with a lucide icon, one with an uploaded image (a public asset stands in for the bucket file)
  await prisma.service.update({ where: { slug: "qa" }, data: { icon: "Shield" } });
  await prisma.service.update({ where: { slug: "web" }, data: { imageUrl: "/assets/photo/services.webp", imagePath: null } });

  // two spec groups with three items each, on top of the production table
  for (const [g, names] of [
    ["Test qrupu A", ["A1", "A2", "A3"]],
    ["Test qrupu B", ["B1", "B2", "B3"]],
  ] as const) {
    const last = await prisma.specGroup.aggregate({ _max: { order: true } });
    await prisma.specGroup.create({
      data: {
        name: json(loc(g, `${g} (en)`, `${g} (ru)`)),
        order: (last._max.order ?? -1) + 1,
        items: { create: names.map((n, order) => ({ name: json(loc(`${n} yanaşma`, `${n} approach`, "")), value: `${n} alət`, unit: order === 2 ? "" : "Tətbiq olunur", order })) },
      },
    });
  }

  // 12 leads: three per status, spread over five dates
  await prisma.lead.deleteMany();
  const statuses = ["NEW", "IN_PROGRESS", "CONTACTED", "ARCHIVED"] as const;
  await prisma.lead.createMany({
    data: Array.from({ length: 12 }, (_, i) => ({
      name: `Müştəri ${String(i + 1).padStart(2, "0")}`,
      email: i % 3 === 2 ? "" : `musteri${i + 1}@example.com`,
      phone: i % 3 === 2 ? `+994 50 000 00 ${String(i).padStart(2, "0")}` : "",
      service: ["Veb və e-ticarət", "Keyfiyyət təminatı", "IT infrastrukturu"][i % 3],
      message: i === 0 ? 'Mesaj; "dırnaq", vergül,\nyeni sətir və <b>HTML</b>' : `Sorğu mətni ${i + 1}`,
      locale: ["az", "en", "ru"][i % 3],
      source: i % 4 === 0 ? "anket" : "contact",
      answers: i % 4 === 0 ? json({ "Sual 1": "Cavab A" }) : undefined,
      status: statuses[i % 4],
      notes: i === 1 ? "daxili qeyd" : "",
      createdAt: day([0, 3, 7, 12, 20][i % 5], 9 + (i % 8)),
    })),
  });

  console.log("QA seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
