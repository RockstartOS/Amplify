import { PrismaClient } from "@prisma/client";
import { generateReference, slugify } from "../src/lib/domain";

const db = new PrismaClient();

// Amsterdam is CET (UTC+1) in November.
const at = (day: number, hhmm: string) => new Date(`2026-11-${day}T${hhmm}:00+01:00`);

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
      slug: "amsterdam-2026",
      name: "Amplify You · Amsterdam",
      tagline: "Where investors and founders amplify what's next.",
      description:
        "A 1.5-day gathering opening with Invested Day — a deep dive into capital, conviction and the state of European venture — followed by Amplify It, a morning of focused tracks where energy, food & bio, scaling and more get the spotlight.",
      city: "Amsterdam",
      venue: "Kromhouthal, Amsterdam-Noord",
      startDate: at(11, "09:00"),
      endDate: at(12, "13:30"),
      published: true,
    },
  });

  console.log("Creating days…");
  const investedDay = await db.eventDay.create({
    data: {
      eventId: event.id,
      name: "Invested Day",
      date: at(11, "00:00"),
      theme: "Capital meets conviction",
      description:
        "A full day for investors and founders: keynotes, panels and live pitches on where European venture is heading.",
      position: 0,
    },
  });
  const amplifyItDay = await db.eventDay.create({
    data: {
      eventId: event.id,
      name: "Amplify It",
      date: at(12, "00:00"),
      theme: "Go deeper, by track",
      description:
        "A morning of parallel tracks. Pick your domain — energy, food & bio, scaling and beyond — and build your own schedule.",
      position: 1,
    },
  });

  console.log("Creating tracks…");
  const trackData = [
    { name: "Amplify Energy", color: "#f59e0b", description: "Grid, storage, climate tech and the energy transition." },
    { name: "Amplify Food & Bio", color: "#22c55e", description: "AgriFood, biotech and the future of what we eat." },
    { name: "Amplify Scaling", color: "#6366f1", description: "From seed to Series B — the craft of scaling a company." },
    { name: "Amplify Health", color: "#ec4899", description: "Digital health, diagnostics and life sciences." },
    { name: "Amplify Emerging Tech", color: "#06b6d4", description: "AI, frontier compute and deep tech." },
  ];
  const tracks: Record<string, { id: string }> = {};
  for (let i = 0; i < trackData.length; i++) {
    const t = trackData[i];
    const track = await db.track.create({
      data: {
        eventId: event.id,
        name: t.name,
        slug: slugify(t.name.replace("Amplify ", "")),
        color: t.color,
        description: t.description,
        position: i,
      },
    });
    tracks[t.name] = track;
  }

  console.log("Creating speakers…");
  const speakerData = [
    { name: "Lena Vermeer", title: "Managing Partner", company: "Northbound Capital", bio: "Backs European climate and energy founders at seed and Series A." },
    { name: "Tomás Oliveira", title: "Founder & CEO", company: "Voltaes", bio: "Building grid-scale storage software across the EU." },
    { name: "Priya Anand", title: "General Partner", company: "Helix Ventures", bio: "Health and bio investor, ex-operator." },
    { name: "Daniel Roth", title: "CTO", company: "Mycelium Foods", bio: "Fermentation and alternative protein at scale." },
    { name: "Sofia Lindqvist", title: "Partner", company: "Scale Collective", bio: "Helps Series A teams build go-to-market engines." },
    { name: "Marcus Bauer", title: "Founder", company: "Photonic Labs", bio: "Frontier compute and photonics." },
    { name: "Aisha Kone", title: "Head of Platform", company: "Rockstart", bio: "Connects founders with the right capital and mentors." },
    { name: "Erik Janssen", title: "Angel Investor", company: "—", bio: "Former founder, now early-stage angel across deep tech." },
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

  console.log("Creating Invested Day sessions…");
  const plenary = async (
    title: string,
    kind: string,
    start: string,
    end: string,
    opts: { description?: string; room?: string; speakers?: string[] } = {}
  ) => {
    const s = await db.session.create({
      data: {
        eventId: event.id,
        dayId: investedDay.id,
        trackId: null,
        title,
        kind,
        startTime: at(11, start),
        endTime: at(11, end),
        room: opts.room ?? "Main Stage",
        description: opts.description,
      },
    });
    if (opts.speakers) await speak(s.id, opts.speakers);
    return s;
  };

  await plenary("Registration & coffee", "BREAK", "09:00", "09:30", { room: "Foyer" });
  await plenary("Opening keynote: Why we amplify", "KEYNOTE", "09:30", "10:15", {
    description: "Setting the tone for the day — conviction, capital and the founders shaping Europe.",
    speakers: ["Aisha Kone"],
  });
  await plenary("Panel: The state of European venture", "PANEL", "10:15", "11:00", {
    description: "Three investors on where the market is, what's overhyped and where the real opportunities sit.",
    speakers: ["Lena Vermeer", "Priya Anand", "Erik Janssen"],
  });
  await plenary("Coffee break", "BREAK", "11:00", "11:30", { room: "Foyer" });
  await plenary("Fireside: Building conviction before consensus", "TALK", "11:30", "12:15", {
    description: "How great investors develop a thesis early and hold it.",
    speakers: ["Lena Vermeer"],
  });
  await plenary("Lunch & networking", "NETWORKING", "12:15", "13:30", { room: "Garden Hall" });
  await plenary("Investor masterclass: Reading a cap table", "WORKSHOP", "13:30", "14:30", {
    description: "A hands-on session on term sheets, dilution and ownership over time.",
    room: "Workshop Room A",
    speakers: ["Sofia Lindqvist"],
  });
  await plenary("Live pitches: Seed showcase", "PITCH", "14:30", "16:00", {
    description: "Eight founders, five minutes each, live Q&A with the room.",
  });
  await plenary("Afternoon break", "BREAK", "16:00", "16:30", { room: "Foyer" });
  await plenary("Closing keynote: The next decade of building", "KEYNOTE", "16:30", "17:30", {
    speakers: ["Marcus Bauer"],
  });
  await plenary("Investor & founder reception", "NETWORKING", "17:30", "19:30", { room: "Rooftop" });

  console.log("Creating Amplify It track sessions…");
  await db.session.create({
    data: {
      eventId: event.id,
      dayId: amplifyItDay.id,
      title: "Welcome coffee",
      kind: "BREAK",
      startTime: at(12, "09:00"),
      endTime: at(12, "09:30"),
      room: "Foyer",
    },
  });

  // For each track: a talk (09:30), a workshop (10:30) and a panel (11:30), in parallel rooms.
  const trackProgramme: Record<string, { talk: string; workshop: string; panel: string; speakers: string[] }> = {
    "Amplify Energy": {
      talk: "Scaling the grid for an electrified Europe",
      workshop: "Workshop: Modelling energy storage economics",
      panel: "Panel: Financing the energy transition",
      speakers: ["Tomás Oliveira", "Lena Vermeer"],
    },
    "Amplify Food & Bio": {
      talk: "The protein transition is a systems problem",
      workshop: "Workshop: Scaling fermentation",
      panel: "Panel: Investing in AgriFood",
      speakers: ["Daniel Roth", "Priya Anand"],
    },
    "Amplify Scaling": {
      talk: "From seed to Series B without breaking",
      workshop: "Workshop: Building a GTM engine",
      panel: "Panel: Hiring your first leaders",
      speakers: ["Sofia Lindqvist", "Aisha Kone"],
    },
    "Amplify Health": {
      talk: "AI in diagnostics: hype vs. reality",
      workshop: "Workshop: Navigating health regulation",
      panel: "Panel: What health investors look for",
      speakers: ["Priya Anand"],
    },
    "Amplify Emerging Tech": {
      talk: "Frontier compute and the photonics bet",
      workshop: "Workshop: Deep tech fundraising",
      panel: "Panel: Backing the technically improbable",
      speakers: ["Marcus Bauer", "Erik Janssen"],
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
        startTime: at(12, "09:30"), endTime: at(12, "10:15"),
        room: roomName, capacity: 80,
        description: `A ${trackName.replace("Amplify ", "").toLowerCase()} deep dive to open the track.`,
      },
    });
    await speak(talk.id, p.speakers.slice(0, 1));

    await db.session.create({
      data: {
        eventId: event.id, dayId: amplifyItDay.id, trackId,
        title: p.workshop, kind: "WORKSHOP",
        startTime: at(12, "10:30"), endTime: at(12, "11:15"),
        room: roomName, capacity: 40,
      },
    });

    const panel = await db.session.create({
      data: {
        eventId: event.id, dayId: amplifyItDay.id, trackId,
        title: p.panel, kind: "PANEL",
        startTime: at(12, "11:30"), endTime: at(12, "12:15"),
        room: roomName, capacity: 80,
      },
    });
    await speak(panel.id, p.speakers);
  }

  await db.session.create({
    data: {
      eventId: event.id,
      dayId: amplifyItDay.id,
      title: "Closing lunch & demo floor",
      kind: "NETWORKING",
      startTime: at(12, "12:30"),
      endTime: at(12, "13:30"),
      room: "Garden Hall",
      description: "Wrap up across tracks, meet the cohort and see the demos.",
    },
  });

  console.log("Creating ticket types…");
  await db.ticketType.createMany({
    data: [
      {
        eventId: event.id, name: "Investor Pass", position: 0,
        description: "Full 1.5-day access for investors, including the reception. Invite-led — verified on registration.",
        priceCents: 0, currency: "EUR", quantity: 150, active: true,
      },
      {
        eventId: event.id, name: "Founder Pass", position: 1,
        description: "Full access for founders building a company. Includes both days and all tracks.",
        priceCents: 29500, currency: "EUR", quantity: 250, active: true,
      },
      {
        eventId: event.id, name: "Full Access", position: 2,
        description: "General admission to everything across both days.",
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
