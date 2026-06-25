import { PrismaClient } from "@prisma/client";
import { generateReference, slugify } from "../src/lib/domain";

const db = new PrismaClient();

// Amsterdam is CEST (UTC+2) in April.
const at = (day: number, hhmm: string) => new Date(`2027-04-${day}T${hhmm}:00+02:00`);

async function main() {
  console.log("Resetting database…");
  await db.agendaItem.deleteMany();
  await db.registration.deleteMany();
  await db.sessionSpeaker.deleteMany();
  await db.session.deleteMany();
  await db.ticketType.deleteMany();
  await db.track.deleteMany();
  await db.eventDay.deleteMany();
  await db.speaker.deleteMany();
  await db.event.deleteMany();

  console.log("Creating event…");
  const event = await db.event.create({
    data: {
      slug: "amsterdam-2027",
      name: "Amplify You · Amsterdam",
      tagline: "Where Europe's builders and backers close the pre-seed gap.",
      description:
        "A 2.5-day gathering of 500+ decision-makers and capital allocators from across Europe. We open on the pre-seed gap and the shift to a value-driven economy, then go deep across the four pillars of resilience — Sustainable Industries, Energy, Food & Bio, and Resilient Societies.",
      city: "Amsterdam",
      venue: "Kromhouthal, Amsterdam-Noord",
      format: "2.5 days",
      expectedAttendees: 500,
      startDate: at(14, "09:00"),
      endDate: at(16, "13:00"),
      published: true,
    },
  });

  console.log("Creating days…");
  const investedDay = await db.eventDay.create({
    data: {
      eventId: event.id,
      name: "Invested Day",
      date: at(14, "00:00"),
      theme: "The Pre-Seed Gap",
      description:
        "Why Europe's most important companies struggle to raise their first round — and how we close the gap. Keynotes, panels and live pitches.",
      position: 0,
    },
  });
  const amplifyItDay = await db.eventDay.create({
    data: {
      eventId: event.id,
      name: "Amplify It",
      date: at(15, "00:00"),
      theme: "The Four Pillars of Resilience",
      description:
        "Parallel tracks across the four pillars. Pick your domain and build your own schedule of deep dives with founders, operators and investors.",
      position: 1,
    },
  });
  const valueDay = await db.eventDay.create({
    data: {
      eventId: event.id,
      name: "Value Day",
      date: at(16, "00:00"),
      theme: "The Value-Driven Economy",
      description:
        "A half-day on building an economy that compounds value, not just capital — capital allocators on stage, demos, and the close.",
      position: 2,
    },
  });

  console.log("Creating tracks (the four pillars)…");
  const trackData = [
    {
      name: "Sustainable Industries",
      color: "#8b8bf0",
      metric: "€1.2TN+ by 2035",
      description:
        "A Europe that builds the world's cleanest and most competitive industries — securing strategic production, prosperity and technological leadership. Industrial electrification, sustainable materials, supply-chain resilience and AI manufacturing.",
    },
    {
      name: "Energy",
      color: "#f59e0b",
      metric: "€4.5TN+ by 2035",
      description:
        "A Europe powered by abundant, clean and affordable energy — strengthening competitiveness, resilience and energy sovereignty. Grid stability, firm renewables, energy efficiency and asset realisation.",
    },
    {
      name: "Food & Bio",
      color: "#22c55e",
      metric: "€600B+ by 2035",
      description:
        "A Europe nourished by regenerative food systems and a thriving bioeconomy — restoring nature, strengthening food security and improving public health. Healthy ingredients, regenerative agriculture, biosolutions and food supply.",
    },
    {
      name: "Resilient Societies",
      color: "#06b6d4",
      metric: "€800B+ by 2035",
      description:
        "A Europe protected by resilient infrastructure, trusted institutions and secure digital systems — safeguarding citizens, democracy and economic stability. Digital sovereignty & cyber, water management, societal resilience and climate adaptation.",
    },
  ];
  const tracks: Record<string, { id: string }> = {};
  for (let i = 0; i < trackData.length; i++) {
    const t = trackData[i];
    const track = await db.track.create({
      data: {
        eventId: event.id,
        name: t.name,
        slug: slugify(t.name),
        color: t.color,
        metric: t.metric,
        description: t.description,
        position: i,
      },
    });
    tracks[t.name] = track;
  }

  console.log("Creating speakers…");
  const speakerData = [
    { name: "Lena Vermeer", title: "Managing Partner", company: "Northbound Capital", bio: "Backs European climate and energy founders at pre-seed and seed." },
    { name: "Tomás Oliveira", title: "Founder & CEO", company: "Voltaes", bio: "Building grid-scale storage software across the EU." },
    { name: "Priya Anand", title: "General Partner", company: "Helix Ventures", bio: "Health, bio and food-systems investor, ex-operator." },
    { name: "Daniel Roth", title: "CTO", company: "Mycelium Foods", bio: "Fermentation and alternative protein at scale." },
    { name: "Sofia Lindqvist", title: "Partner", company: "Scale Collective", bio: "Helps first-round teams build go-to-market engines." },
    { name: "Marcus Bauer", title: "Founder", company: "Photonic Labs", bio: "Frontier compute, photonics and sustainable industry." },
    { name: "Aisha Kone", title: "Head of Platform", company: "Rockstart", bio: "Connects founders with the right capital and mentors." },
    { name: "Erik Janssen", title: "LP & Angel", company: "—", bio: "Capital allocator across European deep tech and sustainability." },
  ];
  const speakers: Record<string, { id: string }> = {};
  for (const s of speakerData) {
    const sp = await db.speaker.create({ data: s });
    speakers[s.name] = sp;
  }

  const speak = (sessionId: string, names: string[]) =>
    Promise.all(
      names.map((name, position) =>
        db.sessionSpeaker.create({
          data: { sessionId, speakerId: speakers[name].id, position },
        })
      )
    );

  console.log("Creating Invested Day sessions (The Pre-Seed Gap)…");
  const plenary = async (
    dayId: string,
    day: number,
    title: string,
    kind: string,
    start: string,
    end: string,
    opts: { description?: string; room?: string; speakers?: string[] } = {}
  ) => {
    const s = await db.session.create({
      data: {
        eventId: event.id,
        dayId,
        trackId: null,
        title,
        kind,
        startTime: at(day, start),
        endTime: at(day, end),
        room: opts.room ?? "Main Stage",
        description: opts.description,
      },
    });
    if (opts.speakers) await speak(s.id, opts.speakers);
    return s;
  };

  await plenary(investedDay.id, 14, "Registration & coffee", "BREAK", "09:00", "09:30", { room: "Foyer" });
  await plenary(investedDay.id, 14, "Opening keynote: The pre-seed gap", "KEYNOTE", "09:30", "10:15", {
    description: "Why Europe under-funds its first rounds — and what it costs the continent.",
    speakers: ["Aisha Kone"],
  });
  await plenary(investedDay.id, 14, "Panel: Closing the first-round gap", "PANEL", "10:15", "11:00", {
    description: "Three investors on the structural reasons European pre-seed is broken, and what fixes it.",
    speakers: ["Lena Vermeer", "Priya Anand", "Erik Janssen"],
  });
  await plenary(investedDay.id, 14, "Coffee break", "BREAK", "11:00", "11:30", { room: "Foyer" });
  await plenary(investedDay.id, 14, "Fireside: Building conviction before consensus", "TALK", "11:30", "12:15", {
    description: "How great pre-seed investors develop a thesis early and hold it.",
    speakers: ["Lena Vermeer"],
  });
  await plenary(investedDay.id, 14, "Lunch & networking", "NETWORKING", "12:15", "13:30", { room: "Garden Hall" });
  await plenary(investedDay.id, 14, "Keynote: Towards a value-driven economy", "KEYNOTE", "13:30", "14:15", {
    description: "From extractive returns to compounding value — a reframing of what capital is for.",
    speakers: ["Marcus Bauer"],
  });
  await plenary(investedDay.id, 14, "Panel: Capital allocators on value over volume", "PANEL", "14:15", "15:15", {
    description: "LPs and GPs on backing the companies that build European resilience.",
    speakers: ["Erik Janssen", "Sofia Lindqvist", "Priya Anand"],
  });
  await plenary(investedDay.id, 14, "Afternoon break", "BREAK", "15:15", "15:45", { room: "Foyer" });
  await plenary(investedDay.id, 14, "Live pitches: Pre-seed showcase", "PITCH", "15:45", "17:15", {
    description: "Twelve founders across the four pillars, five minutes each, live Q&A with the room.",
  });
  await plenary(investedDay.id, 14, "Investor & founder reception", "NETWORKING", "17:30", "19:30", { room: "Rooftop" });

  console.log("Creating Amplify It track sessions (The Four Pillars)…");
  await db.session.create({
    data: {
      eventId: event.id, dayId: amplifyItDay.id, title: "Welcome coffee",
      kind: "BREAK", startTime: at(15, "09:00"), endTime: at(15, "09:30"), room: "Foyer",
    },
  });

  const trackProgramme: Record<string, { talk: string; workshop: string; panel: string; speakers: string[] }> = {
    "Sustainable Industries": {
      talk: "Electrifying European industry",
      workshop: "Workshop: Financing sustainable materials",
      panel: "Panel: Supply-chain resilience as strategy",
      speakers: ["Marcus Bauer", "Sofia Lindqvist"],
    },
    "Energy": {
      talk: "Scaling the grid for an electrified Europe",
      workshop: "Workshop: Modelling energy storage economics",
      panel: "Panel: Financing firm renewables",
      speakers: ["Tomás Oliveira", "Lena Vermeer"],
    },
    "Food & Bio": {
      talk: "Regenerative food systems at scale",
      workshop: "Workshop: Scaling biosolutions",
      panel: "Panel: Investing in the bioeconomy",
      speakers: ["Daniel Roth", "Priya Anand"],
    },
    "Resilient Societies": {
      talk: "Digital sovereignty and the resilient state",
      workshop: "Workshop: Building for climate adaptation",
      panel: "Panel: Backing trust, water and cyber",
      speakers: ["Aisha Kone", "Erik Janssen"],
    },
  };

  let room = 1;
  for (const trackName of Object.keys(trackProgramme)) {
    const p = trackProgramme[trackName];
    const trackId = tracks[trackName].id;
    const roomName = `Track Room ${room++}`;

    const talk = await db.session.create({
      data: {
        eventId: event.id, dayId: amplifyItDay.id, trackId,
        title: p.talk, kind: "TALK",
        startTime: at(15, "09:30"), endTime: at(15, "10:15"),
        room: roomName, capacity: 80,
        description: `A ${trackName.toLowerCase()} deep dive to open the track.`,
      },
    });
    await speak(talk.id, p.speakers.slice(0, 1));

    await db.session.create({
      data: {
        eventId: event.id, dayId: amplifyItDay.id, trackId,
        title: p.workshop, kind: "WORKSHOP",
        startTime: at(15, "10:30"), endTime: at(15, "11:15"),
        room: roomName, capacity: 40,
      },
    });

    const panel = await db.session.create({
      data: {
        eventId: event.id, dayId: amplifyItDay.id, trackId,
        title: p.panel, kind: "PANEL",
        startTime: at(15, "11:30"), endTime: at(15, "12:15"),
        room: roomName, capacity: 80,
      },
    });
    await speak(panel.id, p.speakers);
  }

  await db.session.create({
    data: {
      eventId: event.id, dayId: amplifyItDay.id, title: "Closing lunch & demo floor",
      kind: "NETWORKING", startTime: at(15, "12:30"), endTime: at(15, "13:30"), room: "Garden Hall",
      description: "Wrap up across the four pillars, meet the cohort and see the demos.",
    },
  });

  console.log("Creating Value Day sessions (The Value-Driven Economy)…");
  await plenary(valueDay.id, 16, "Welcome coffee", "BREAK", "09:00", "09:30", { room: "Foyer" });
  await plenary(valueDay.id, 16, "Keynote: The decade of resilience", "KEYNOTE", "09:30", "10:15", {
    description: "What a value-driven European economy looks like by 2035.",
    speakers: ["Aisha Kone"],
  });
  await plenary(valueDay.id, 16, "Panel: Allocators on the value-driven economy", "PANEL", "10:15", "11:15", {
    description: "Capital allocators on moving from volume to value across the four pillars.",
    speakers: ["Erik Janssen", "Lena Vermeer"],
  });
  await plenary(valueDay.id, 16, "Demo finale & close", "NETWORKING", "11:30", "13:00", {
    description: "The strongest pre-seed teams demo live, then we close the 2.5 days together.",
    room: "Main Stage",
  });

  console.log("Creating ticket types…");
  await db.ticketType.createMany({
    data: [
      {
        eventId: event.id, name: "Investor Pass", position: 0,
        description: "Full 2.5-day access for investors and capital allocators, including the reception. Invite-led — verified on registration.",
        priceCents: 0, currency: "EUR", quantity: 200, active: true,
      },
      {
        eventId: event.id, name: "Founder Pass", position: 1,
        description: "Full access for founders building across the four pillars. Both plenary days and all tracks.",
        priceCents: 29500, currency: "EUR", quantity: 250, active: true,
      },
      {
        eventId: event.id, name: "Full Access", position: 2,
        description: "General admission to everything across all 2.5 days.",
        priceCents: 49500, currency: "EUR", quantity: 300, active: true,
      },
      {
        eventId: event.id, name: "Community / Student", position: 3,
        description: "Discounted access for students and community members. Limited availability.",
        priceCents: 9500, currency: "EUR", quantity: 100, active: true,
      },
    ],
  });

  console.log("Creating a sample registration…");
  const founderPass = await db.ticketType.findFirst({ where: { eventId: event.id, name: "Founder Pass" } });
  if (founderPass) {
    await db.registration.create({
      data: {
        reference: generateReference(),
        eventId: event.id,
        ticketTypeId: founderPass.id,
        firstName: "Sam",
        lastName: "Rivera",
        email: "sam@example.com",
        company: "Acme Climate",
        role: "Founder",
        status: "CONFIRMED",
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
