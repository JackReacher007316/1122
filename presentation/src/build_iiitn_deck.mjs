import fs from "node:fs";

const W = 1920;
const H = 1080;

const C = {
  bg: "#05050A",
  bg2: "#0F0C19",
  panel: "#151225",
  panel2: "#201936",
  text: "#F4F4F5",
  muted: "#A1A1AA",
  pink: "#FF107A",
  cyan: "#00E5FF",
  purple: "#A855F7",
  red: "#E50914",
  gold: "#FFD700",
  green: "#00FF87",
  white: "#FFFFFF",
};

const OUT = "C:/Users/AARYAN/pratice/presentation/output/IIITN_Fantasy_Arena_Presentation.pptx";
const PREVIEW_DIR = "C:/Users/AARYAN/pratice/presentation/scratch/previews";
const INSPECT = "C:/Users/AARYAN/pratice/presentation/scratch/inspect.json";
const REPORT = "C:/Users/AARYAN/pratice/presentation/scratch/build-report.json";
const ASSET_DIR = "C:/Users/AARYAN/pratice/presentation/assets/processed";
const A = {
  max: `${ASSET_DIR}/max_verstappen.png`,
  rohit: `${ASSET_DIR}/rohit_sharma.png`,
  ronaldo: `${ASSET_DIR}/cristiano_ronaldo.png`,
  messi: `${ASSET_DIR}/lionel_messi.png`,
  virat: `${ASSET_DIR}/virat_kohli.png`,
  dhoni: `${ASSET_DIR}/ms_dhoni.png`,
  haaland: `${ASSET_DIR}/erling_haaland.png`,
  salah: `${ASSET_DIR}/mohamed_salah.png`,
  hamilton: `${ASSET_DIR}/lewis_hamilton.png`,
  leclerc: `${ASSET_DIR}/charles_leclerc.png`,
};
const IMAGE_DATA_URLS = new Map();

function noLine(color = C.bg) {
  return { style: "solid", fill: color, width: 0 };
}

function solid(color) {
  return { type: "solid", color };
}

function grad(a, b, c = null, angleDeg = 30) {
  const stops = [
    { offset: 0, color: a },
    { offset: c ? 54000 : 100000, color: b },
  ];
  if (c) stops.push({ offset: 100000, color: c });
  return { type: "gradient", gradientKind: "linear", angleDeg, stops };
}

function addShape(slide, name, geometry, position, fillColor, lineColor = null, width = 0) {
  const props = {
    geometry,
    position,
    line: lineColor ? { style: "solid", fill: lineColor, width } : noLine(typeof fillColor === "string" ? fillColor : C.bg),
  };
  if (fillColor) props.fill = typeof fillColor === "string" ? solid(fillColor) : fillColor;
  const shape = slide.shapes.add(props);
  shape.name = name;
  return shape;
}

function addText(slide, name, value, position, style = {}) {
  const textFill = style.fill === undefined || style.fill === C.bg ? null : style.fill;
  const box = addShape(slide, name, "rect", position, textFill, style.line || null, style.lineWidth || 0);
  box.text.style = {
    fontSize: style.fontSize || 28,
    color: style.color || C.text,
    bold: Boolean(style.bold),
    alignment: style.alignment || "left",
    verticalAlignment: style.verticalAlignment || "top",
    lineSpacing: style.lineSpacing || 1.08,
    fontFace: style.fontFace || "Orbitron",
  };
  box.text = value;
  return box;
}

function addLabel(slide, text, x, y, w, color = C.cyan) {
  const chip = addShape(slide, `label.${text}`, "roundRect", { left: x, top: y, width: w, height: 42 }, C.bg2, color, 2);
  chip.text.style = {
    fontSize: 17,
    color,
    bold: true,
    alignment: "center",
    verticalAlignment: "middle",
    fontFace: "Orbitron",
  };
  chip.text = text;
  return chip;
}

function addTinyRule(slide, x, y, w, color = C.pink) {
  addShape(slide, `rule.${x}.${y}`, "rect", { left: x, top: y, width: w, height: 5 }, color);
}

function addBase(slide, idx, section) {
  addShape(slide, `background.${idx}`, "rect", { left: 0, top: 0, width: W, height: H }, grad(C.bg, "#101027", "#1A1026", 25));
  addShape(slide, `accent.slash.${idx}.1`, "rect", { left: 1780, top: -180, width: 90, height: 1420, rotation: 21 }, C.pink);
  addShape(slide, `accent.slash.${idx}.2`, "rect", { left: 1892, top: -180, width: 30, height: 1420, rotation: 21 }, C.cyan);
  addShape(slide, `accent.floor.${idx}`, "rect", { left: 0, top: 1000, width: W, height: 80 }, C.bg2);
  addShape(slide, `accent.floor.line.${idx}`, "rect", { left: 96, top: 996, width: 520, height: 4 }, C.pink);
  addText(slide, `footer.section.${idx}`, section.toUpperCase(), { left: 96, top: 1016, width: 820, height: 34 }, {
    fontSize: 17,
    color: C.muted,
    bold: true,
    fill: C.bg2,
  });
  addText(slide, `footer.page.${idx}`, String(idx).padStart(2, "0"), { left: 1758, top: 1010, width: 82, height: 42 }, {
    fontSize: 22,
    color: C.cyan,
    bold: true,
    alignment: "right",
    fill: C.bg2,
  });
}

function addSlideTitle(slide, idx, section, title, subtitle = "") {
  addBase(slide, idx, section);
  addLabel(slide, section.toUpperCase(), 96, 72, Math.max(200, section.length * 17 + 44), C.pink);
  addText(slide, `slide-title.${idx}`, title, { left: 96, top: 138, width: 1250, height: 118 }, {
    fontSize: 52,
    color: C.white,
    bold: true,
    fill: C.bg,
  });
  if (subtitle) {
    addText(slide, `slide-subtitle.${idx}`, subtitle, { left: 100, top: 268, width: 1160, height: 68 }, {
      fontSize: 25,
      color: C.muted,
      fill: C.bg,
      fontFace: "Noto Sans JP",
    });
  }
}

function addMetric(slide, name, value, label, x, y, w, accent) {
  addShape(slide, `${name}.plate`, "roundRect", { left: x, top: y, width: w, height: 156 }, C.panel, accent, 2);
  addText(slide, `${name}.value`, value, { left: x + 24, top: y + 26, width: w - 48, height: 58 }, {
    fontSize: 40,
    color: accent,
    bold: true,
    fill: C.panel,
  });
  addText(slide, `${name}.label`, label, { left: x + 24, top: y + 92, width: w - 48, height: 44 }, {
    fontSize: 20,
    color: C.text,
    fill: C.panel,
    fontFace: "Noto Sans JP",
  });
}

function addNode(slide, name, label, sub, x, y, w, h, accent) {
  addShape(slide, `${name}.node`, "roundRect", { left: x, top: y, width: w, height: h }, C.panel, accent, 2);
  addShape(slide, `${name}.accent`, "rect", { left: x, top: y, width: 8, height: h }, accent);
  addText(slide, `${name}.label`, label, { left: x + 26, top: y + 22, width: w - 48, height: 38 }, {
    fontSize: 25,
    color: C.white,
    bold: true,
    fill: C.panel,
  });
  addText(slide, `${name}.sub`, sub, { left: x + 26, top: y + 66, width: w - 52, height: h - 82 }, {
    fontSize: 19,
    color: C.muted,
    fill: C.panel,
    fontFace: "Noto Sans JP",
  });
}

function addArrow(slide, name, x, y, w, h, color) {
  addShape(slide, name, "rightArrow", { left: x, top: y, width: w, height: h }, color);
}

function addPhoto(slide, name, path, x, y, w, h, accent = C.pink, fit = "cover") {
  addShape(slide, `${name}.frame`, "roundRect", { left: x - 6, top: y - 6, width: w + 12, height: h + 12 }, C.panel, accent, 3);
  if (!IMAGE_DATA_URLS.has(path)) {
    const bytes = fs.readFileSync(path);
    IMAGE_DATA_URLS.set(path, `data:image/png;base64,${bytes.toString("base64")}`);
  }
  const img = slide.images.add({
    dataUrl: IMAGE_DATA_URLS.get(path),
    contentType: "image/png",
    alt: name,
    position: { left: x, top: y, width: w, height: h },
    fit,
  });
  img.name = `${name}.image`;
  img.geometry = "roundRect";
  return img;
}

function addPlayerCard(slide, id, player, role, sport, path, x, y, w, h, accent) {
  addPhoto(slide, `${id}.photo`, path, x, y, w, h - 74, accent, "contain");
  addShape(slide, `${id}.caption`, "roundRect", { left: x, top: y + h - 90, width: w, height: 90 }, C.panel, accent, 2);
  addText(slide, `${id}.name`, player, { left: x + 18, top: y + h - 78, width: w - 36, height: 32 }, {
    fontSize: 22,
    color: C.white,
    bold: true,
    fill: C.panel,
    fontFace: "Noto Sans JP",
  });
  addText(slide, `${id}.meta`, `${sport} | ${role}`, { left: x + 18, top: y + h - 42, width: w - 36, height: 24 }, {
    fontSize: 15,
    color: accent,
    bold: true,
    fill: C.panel,
    fontFace: "Noto Sans JP",
  });
}

function addBullet(slide, name, text, x, y, w, accent = C.cyan) {
  addShape(slide, `${name}.dot`, "ellipse", { left: x, top: y + 8, width: 16, height: 16 }, accent);
  addText(slide, `${name}.text`, text, { left: x + 34, top: y, width: w, height: 48 }, {
    fontSize: 23,
    color: C.text,
    fill: C.bg,
    fontFace: "Noto Sans JP",
  });
}

function addSimpleTable(slide, name, columns, rows, x, y, colWidths, rowH, accent) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  addShape(slide, `${name}.frame`, "roundRect", { left: x, top: y, width: totalW, height: rowH * (rows.length + 1) }, C.panel, accent, 2);
  let cx = x;
  columns.forEach((col, i) => {
    addText(slide, `${name}.header.${i}`, col, { left: cx + 12, top: y + 10, width: colWidths[i] - 24, height: rowH - 16 }, {
      fontSize: 18,
      color: accent,
      bold: true,
      fill: C.panel,
      fontFace: "Noto Sans JP",
    });
    cx += colWidths[i];
  });
  rows.forEach((row, r) => {
    const top = y + rowH * (r + 1);
    addShape(slide, `${name}.row.${r}`, "rect", { left: x + 14, top, width: totalW - 28, height: 1.5 }, r === 0 ? accent : "#343047");
    let rx = x;
    row.forEach((cell, c) => {
      addText(slide, `${name}.cell.${r}.${c}`, cell, { left: rx + 12, top: top + 12, width: colWidths[c] - 24, height: rowH - 16 }, {
        fontSize: c === 0 ? 20 : 18,
        color: c === 0 ? C.white : C.muted,
        bold: c === 0,
        fill: C.panel,
        fontFace: "Noto Sans JP",
      });
      rx += colWidths[c];
    });
  });
}

function cover(presentation) {
  const slide = presentation.slides.add();
  addShape(slide, "cover.bg", "rect", { left: 0, top: 0, width: W, height: H }, grad("#020207", "#121331", "#2A0B22", 18));
  addShape(slide, "cover.track.1", "rect", { left: 1190, top: -180, width: 110, height: 1500, rotation: 22 }, C.pink);
  addShape(slide, "cover.track.2", "rect", { left: 1326, top: -180, width: 36, height: 1500, rotation: 22 }, C.cyan);
  addShape(slide, "cover.track.3", "rect", { left: 1415, top: -180, width: 78, height: 1500, rotation: 22 }, C.purple);
  addPhoto(slide, "cover.max", A.max, 1486, 118, 230, 176, C.red, "contain");
  addPhoto(slide, "cover.rohit", A.rohit, 1286, 338, 230, 176, C.gold);
  addPhoto(slide, "cover.messi", A.messi, 1518, 560, 230, 176, C.cyan);
  addPhoto(slide, "cover.ronaldo", A.ronaldo, 1320, 760, 230, 176, C.green);
  addLabel(slide, "COLLEGE PROJECT DEMO", 104, 88, 330, C.cyan);
  addText(slide, "cover.kicker", "IIITN", { left: 102, top: 188, width: 680, height: 86 }, {
    fontSize: 72,
    color: C.pink,
    bold: true,
    fill: C.bg,
  });
  addText(slide, "cover.title", "FANTASY\nARENA", { left: 96, top: 278, width: 1040, height: 286 }, {
    fontSize: 108,
    color: C.white,
    bold: true,
    fill: C.bg,
    lineSpacing: 0.88,
  });
  addTinyRule(slide, 104, 602, 420, C.pink);
  addText(slide, "cover.subtitle", "Fantasy League & Watch Party Platform", { left: 104, top: 638, width: 920, height: 58 }, {
    fontSize: 34,
    color: C.cyan,
    bold: true,
    fill: C.bg,
  });
  addText(slide, "cover.promise", "A unified campus experience for drafting teams, joining contests, tracking live scores, streaming watch parties, and getting AI coaching.", { left: 106, top: 730, width: 960, height: 116 }, {
    fontSize: 26,
    color: C.text,
    fill: C.bg,
    fontFace: "Noto Sans JP",
    lineSpacing: 1.16,
  });
  ["CRICKET", "FOOTBALL", "F1", "HACKATHON"].forEach((tag, i) => addLabel(slide, tag, 104 + i * 188, 884, 150, [C.gold, C.green, C.red, C.cyan][i]));
  addText(slide, "cover.date", "React + Express + Prisma + Socket.IO + Streaming + AI", { left: 1040, top: 956, width: 680, height: 44 }, {
    fontSize: 20,
    color: C.muted,
    alignment: "right",
    fill: C.bg,
    fontFace: "Noto Sans JP",
  });
  slide.speakerNotes.text = "Introduce the project as a sports and events platform built for a college demo, not just a fantasy picker.";
}

function slide2(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 2, "Motivation", "Campus events are exciting, but the digital experience is split", "The project brings prediction, live viewing, scores, and community into one flow.");
  const items = [
    ["Watch", "Streaming links or screen share happen outside the event app.", C.red],
    ["Predict", "Fantasy team strategy is separate from the live match context.", C.gold],
    ["Track", "Scores, standings, and leaderboards need manual checking.", C.cyan],
    ["Discuss", "Users still need help understanding rules and setup.", C.purple],
  ];
  items.forEach((it, i) => addNode(slide, `problem.${i}`, it[0], it[1], 116 + i * 422, 420, 344, 220, it[2]));
  addText(slide, "problem.thesis", "Need: one arena where participation continues before, during, and after the event.", { left: 180, top: 746, width: 1110, height: 92 }, {
    fontSize: 36,
    color: C.white,
    bold: true,
    fill: C.bg,
  });
  addShape(slide, "problem.ring", "ellipse", { left: 1390, top: 666, width: 260, height: 260 }, C.panel, C.pink, 3);
  addText(slide, "problem.ring.text", "ONE\nARENA", { left: 1420, top: 732, width: 200, height: 112 }, {
    fontSize: 40,
    color: C.pink,
    bold: true,
    alignment: "center",
    fill: C.panel,
    lineSpacing: 0.9,
  });
  slide.speakerNotes.text = "Frame the motivation as fragmentation: watching, prediction, scoring, and help are usually in different places.";
}

function slide3(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 3, "Objective", "Build a playable event platform, not only a scoreboard", "The objective is to turn IIITN events into interactive live experiences.");
  addText(slide, "objective.big", "Let every viewer become a manager.", { left: 116, top: 386, width: 880, height: 132 }, {
    fontSize: 60,
    color: C.white,
    bold: true,
    fill: C.bg,
  });
  const pillars = [
    ["Pre-event", "Browse matches, choose sport, create team before deadline", C.cyan],
    ["Live event", "Watch stream, track scores, follow contest position", C.red],
    ["Post-event", "Leaderboard, rankings, points, and learning loop", C.green],
  ];
  pillars.forEach((p, i) => {
    const x = 110 + i * 560;
    addShape(slide, `objective.pillar.${i}.line`, "rect", { left: x, top: 610, width: 406, height: 6 }, p[2]);
    addText(slide, `objective.pillar.${i}.title`, p[0], { left: x, top: 642, width: 420, height: 48 }, {
      fontSize: 32,
      color: p[2],
      bold: true,
      fill: C.bg,
    });
    addText(slide, `objective.pillar.${i}.body`, p[1], { left: x, top: 704, width: 420, height: 94 }, {
      fontSize: 23,
      color: C.text,
      fill: C.bg,
      fontFace: "Noto Sans JP",
    });
  });
  addShape(slide, "objective.core", "roundRect", { left: 1142, top: 360, width: 470, height: 150 }, C.panel, C.pink, 2);
  addText(slide, "objective.core.text", "Fantasy + Streaming + Live Data + AI", { left: 1180, top: 402, width: 395, height: 72 }, {
    fontSize: 30,
    color: C.white,
    bold: true,
    alignment: "center",
    fill: C.panel,
  });
  slide.speakerNotes.text = "Use this slide to state the project objective in product language before moving into features.";
}

function slide4(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 4, "Overview", "One platform, six connected modules", "Each module maps directly to a route or service in the current app.");
  addShape(slide, "overview.center", "ellipse", { left: 755, top: 410, width: 410, height: 250 }, C.panel, C.pink, 3);
  addText(slide, "overview.center.text", "IIITN\nFantasy Arena", { left: 794, top: 470, width: 330, height: 120 }, {
    fontSize: 38,
    color: C.white,
    bold: true,
    alignment: "center",
    fill: C.panel,
    lineSpacing: 0.92,
  });
  const nodes = [
    ["Matches", "Dashboard and match detail", 170, 380, C.gold],
    ["Team Draft", "11-player selection rules", 460, 710, C.cyan],
    ["Contests", "Entry fees and rankings", 1010, 710, C.green],
    ["Live Scores", "Cricket and F1 tracking", 1330, 380, C.red],
    ["Watch Party", "OBS and screen share", 1005, 290, C.purple],
    ["AI Coach", "Champak guidance", 450, 290, C.pink],
  ];
  nodes.forEach(([title, sub, x, y, color], i) => {
    addNode(slide, `overview.node.${i}`, title, sub, x, y, 330, 132, color);
  });
  slide.speakerNotes.text = "Explain that these are not imagined modules; they are visible in the current app routes and backend endpoints.";
}

function slide5(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 5, "User Journey", "From match discovery to leaderboard in one session", "The flow is designed around a student opening the app before a live event.");
  const steps = [
    ["1", "Discover", "Filter cricket, football, F1, or hackathon events.", C.cyan],
    ["2", "Draft", "Build an 11-member team within credits and role limits.", C.gold],
    ["3", "Enter", "Join mega, head-to-head, practice, or winner-takes-all contests.", C.green],
    ["4", "Watch", "Stream via OBS or browser screen share.", C.red],
    ["5", "Track", "Follow scores, rankings, and AI tips.", C.pink],
  ];
  steps.forEach((s, i) => {
    const x = i === 4 ? 1370 : 116 + i * 344;
    addShape(slide, `journey.badge.${i}`, "ellipse", { left: x + 88, top: 398, width: 118, height: 118 }, C.panel, s[3], 3);
    addText(slide, `journey.num.${i}`, s[0], { left: x + 115, top: 424, width: 64, height: 60 }, {
      fontSize: 42,
      color: s[3],
      bold: true,
      alignment: "center",
      fill: C.panel,
    });
    addText(slide, `journey.title.${i}`, s[1], { left: x, top: 548, width: 292, height: 48 }, {
      fontSize: 32,
      color: C.white,
      bold: true,
      alignment: "center",
      fill: C.bg,
    });
    const bodyLeft = i >= 3 ? x + 34 : x;
    const bodyWidth = i >= 3 ? 224 : 292;
    addText(slide, `journey.body.${i}`, s[2], { left: bodyLeft, top: 612, width: bodyWidth, height: 102 }, {
      fontSize: 20,
      color: C.muted,
      alignment: "center",
      fill: C.bg,
      fontFace: "Noto Sans JP",
    });
    if (i < steps.length - 1) addShape(slide, `journey.line.${i}`, "rect", { left: x + 228, top: 453, width: 116, height: 8 }, s[3]);
  });
  addText(slide, "journey.close", "The product keeps users inside the event loop instead of sending them to separate tools.", { left: 286, top: 808, width: 1180, height: 60 }, {
    fontSize: 30,
    color: C.text,
    bold: true,
    alignment: "center",
    fill: C.bg,
  });
  slide.speakerNotes.text = "Walk the review panel through the product as a user experience, not as isolated pages.";
}

function slide6(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 6, "Fantasy Team Creation", "Drafting uses Dream11-style constraints", "The app validates credits, roles, team balance, captain, and vice-captain choices.");
  addShape(slide, "draft.phone", "roundRect", { left: 114, top: 330, width: 590, height: 560 }, C.panel, C.cyan, 3);
  addText(slide, "draft.phone.title", "CREATE TEAM", { left: 154, top: 362, width: 510, height: 48 }, {
    fontSize: 28,
    color: C.cyan,
    bold: true,
    fill: C.panel,
  });
  addMetric(slide, "draft.credits", "100", "Total credits", 156, 440, 190, C.gold);
  addMetric(slide, "draft.players", "11", "Players required", 378, 440, 242, C.pink);
  const roles = [["WK", 1, C.cyan], ["BAT", 3, C.gold], ["AR", 1, C.green], ["BOWL", 3, C.pink]];
  roles.forEach(([role, min, color], i) => {
    addShape(slide, `draft.role.${i}`, "roundRect", { left: 156 + i * 118, top: 638, width: 94, height: 72 }, C.bg2, color, 2);
    addText(slide, `draft.role.text.${i}`, `${role}\nmin ${min}`, { left: 164 + i * 118, top: 650, width: 78, height: 48 }, {
      fontSize: 17,
      color,
      bold: true,
      alignment: "center",
      fill: C.bg2,
      lineSpacing: 0.92,
    });
  });
  addText(slide, "draft.captain", "Captain = 2x points\nVice-Captain = 1.5x points", { left: 156, top: 752, width: 480, height: 80 }, {
    fontSize: 26,
    color: C.white,
    bold: true,
    fill: C.panel,
    lineSpacing: 1.08,
  });
  addBullet(slide, "draft.b1", "Budget guard: a player cannot be selected if credits are insufficient.", 825, 386, 840, C.gold);
  addBullet(slide, "draft.b2", "Role guard: each sport has minimum and maximum composition rules.", 825, 478, 840, C.cyan);
  addBullet(slide, "draft.b3", "Team guard: max seven players from one real-world side.", 825, 570, 840, C.green);
  addBullet(slide, "draft.b4", "Auth guard: only logged-in users can lock teams and join contests.", 825, 662, 840, C.pink);
  addText(slide, "draft.source", "Source: CreateTeam.jsx role config and backend /api/team endpoint.", { left: 826, top: 802, width: 760, height: 34 }, {
    fontSize: 16,
    color: C.muted,
    fill: C.bg,
    fontFace: "Noto Sans JP",
  });
  addPhoto(slide, "draft.rohit.photo", A.rohit, 1702, 346, 100, 86, C.gold);
  addPhoto(slide, "draft.max.photo", A.max, 1702, 480, 100, 86, C.red);
  addPhoto(slide, "draft.ronaldo.photo", A.ronaldo, 1702, 614, 100, 86, C.green);
  slide.speakerNotes.text = "This slide shows the rules that make team creation a real fantasy workflow rather than a simple checklist.";
}

function slide7(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 7, "Contests & Leaderboard", "Competition layers sit on top of every match", "Users choose contests, spend wallet balance, and climb rankings based on points.");
  const contests = [
    ["Mega Contest", "Entry: 49", "Large pool"],
    ["Head to Head", "Entry: 25", "Two players"],
    ["Practice Match", "Entry: 0", "Free mode"],
    ["Winner Takes All", "Entry: 100", "Top prize"],
  ];
  contests.forEach((row, i) => addNode(slide, `contest.${i}`, row[0], `${row[1]} | ${row[2]}`, 122, 360 + i * 126, 520, 94, [C.pink, C.gold, C.cyan, C.green][i]));
  addShape(slide, "leaderboard.podium.1", "rect", { left: 1010, top: 580, width: 166, height: 230 }, C.gold);
  addShape(slide, "leaderboard.podium.2", "rect", { left: 824, top: 654, width: 166, height: 156 }, C.cyan);
  addShape(slide, "leaderboard.podium.3", "rect", { left: 1196, top: 704, width: 166, height: 106 }, C.pink);
  addText(slide, "leaderboard.podium.1.text", "1", { left: 1050, top: 626, width: 86, height: 70 }, { fontSize: 54, color: C.bg, bold: true, alignment: "center", fill: C.gold });
  addText(slide, "leaderboard.podium.2.text", "2", { left: 864, top: 690, width: 86, height: 64 }, { fontSize: 48, color: C.bg, bold: true, alignment: "center", fill: C.cyan });
  addText(slide, "leaderboard.podium.3.text", "3", { left: 1236, top: 730, width: 86, height: 56 }, { fontSize: 42, color: C.bg, bold: true, alignment: "center", fill: C.pink });
  addSimpleTable(slide, "rank.table", ["Rank", "Manager", "Points"], [["1", "Top scorer", "980"], ["2", "Chaser", "910"], ["3", "Rising team", "870"]], 800, 358, [120, 300, 160], 58, C.cyan);
  addText(slide, "contest.logic", "Contest entries connect User + FantasyTeam + Contest, so one scoring update can reorder the board.", { left: 786, top: 842, width: 770, height: 56 }, {
    fontSize: 24,
    color: C.text,
    bold: true,
    fill: C.bg,
    fontFace: "Noto Sans JP",
  });
  slide.speakerNotes.text = "Explain how wallet, contests, entries, points, and rankings work together.";
}

function slide8(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 8, "Live Match Center", "Scores and standings keep the event active", "The app includes dedicated live views for cricket, football, and Formula 1 tracking.");
  addShape(slide, "live.screen", "roundRect", { left: 118, top: 350, width: 760, height: 460 }, C.panel, C.red, 3);
  addText(slide, "live.header", "LIVE DATA", { left: 158, top: 388, width: 220, height: 44 }, { fontSize: 26, color: C.red, bold: true, fill: C.panel });
  addText(slide, "live.score", "CSK 184/5\nRCB chasing", { left: 158, top: 456, width: 330, height: 138 }, {
    fontSize: 42,
    color: C.white,
    bold: true,
    fill: C.panel,
    lineSpacing: 0.95,
  });
  addText(slide, "live.refresh", "Auto refresh every 30 seconds", { left: 158, top: 628, width: 420, height: 42 }, {
    fontSize: 22,
    color: C.cyan,
    bold: true,
    fill: C.panel,
    fontFace: "Noto Sans JP",
  });
  const bars = [["P1 Verstappen", 320, C.red], ["P2 Leclerc", 260, C.gold], ["P3 Norris", 220, C.cyan]];
  bars.forEach((b, i) => {
    addText(slide, `live.bar.label.${i}`, b[0], { left: 500, top: 470 + i * 70, width: 230, height: 34 }, {
      fontSize: 20,
      color: C.text,
      fill: C.panel,
      fontFace: "Noto Sans JP",
    });
    addShape(slide, `live.bar.${i}`, "rect", { left: 500, top: 510 + i * 70, width: b[1], height: 18 }, b[2]);
  });
  addBullet(slide, "live.b1", "Dedicated sport cards route users to the relevant live page.", 1010, 390, 660, C.cyan);
  addBullet(slide, "live.b2", "Cricket and F1 data are fetched through backend endpoints.", 1010, 486, 660, C.red);
  addBullet(slide, "live.b3", "Live score context supports team decisions and contest engagement.", 1010, 582, 660, C.gold);
  addBullet(slide, "live.b4", "The design keeps live data visually separate from fantasy selection.", 1010, 678, 660, C.green);
  slide.speakerNotes.text = "Mention the live endpoints and the user-facing Live Match Center screens.";
}

function slide9(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 9, "Watch Party & Streaming", "The platform supports both OBS and browser screen sharing", "The watch party module is built for live campus broadcasting and shared viewing.");
  const blocks = [
    ["OBS Studio", "RTMP input\nrtmp://host:1935/live", 138, 454, C.red],
    ["Node Media Server", "Tracks active stream\nFLV playback on :8888", 530, 454, C.pink],
    ["Watch Party UI", "Video player, status,\ncopyable stream settings", 922, 454, C.cyan],
    ["Viewers", "Socket.IO presence\nor WebRTC screen share", 1314, 454, C.green],
  ];
  blocks.forEach((b, i) => {
    addNode(slide, `stream.block.${i}`, b[0], b[1], b[2], b[3], 300, 166, b[4]);
    if (i < blocks.length - 1) addArrow(slide, `stream.arrow.${i}`, b[2] + 318, b[3] + 58, 64, 38, b[4]);
  });
  addShape(slide, "stream.video", "roundRect", { left: 316, top: 706, width: 780, height: 150 }, C.bg2, C.cyan, 2);
  addShape(slide, "stream.live.dot", "ellipse", { left: 360, top: 756, width: 34, height: 34 }, C.red);
  addText(slide, "stream.video.text", "LIVE WATCH PARTY: OBS stream or direct browser broadcast", { left: 420, top: 748, width: 610, height: 48 }, {
    fontSize: 26,
    color: C.white,
    bold: true,
    fill: C.bg2,
    fontFace: "Noto Sans JP",
  });
  addText(slide, "stream.source", "Source: WatchParty.jsx, NodeMediaServer setup, and Socket.IO signaling in server.js.", { left: 1120, top: 760, width: 520, height: 58 }, {
    fontSize: 17,
    color: C.muted,
    fill: C.bg,
    fontFace: "Noto Sans JP",
  });
  slide.speakerNotes.text = "Explain the two modes: OBS Studio for formal streaming and WebRTC/screen share for quick browser broadcasting.";
}

function slide10(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 10, "AI Coach: Champak", "An in-app guide reduces confusion during live play", "Champak answers questions about drafting, scoring, OBS setup, and fantasy strategy.");
  addShape(slide, "chat.window", "roundRect", { left: 128, top: 330, width: 620, height: 560 }, C.panel, C.pink, 3);
  addText(slide, "chat.header", "CHAMPAK  AI ONLINE", { left: 168, top: 366, width: 500, height: 42 }, {
    fontSize: 25,
    color: C.pink,
    bold: true,
    fill: C.panel,
  });
  const msgs = [
    ["AI", "Ask me about drafting teams, scoring rules, live streams, or OBS setup.", C.purple],
    ["USER", "Tips for picking a Captain?", C.cyan],
    ["AI", "Pick high-form players with reliable scoring. Captain earns 2x points.", C.pink],
  ];
  msgs.forEach((m, i) => {
    const x = m[0] === "USER" ? 292 : 168;
    const w = m[0] === "USER" ? 386 : 500;
    addShape(slide, `chat.msg.${i}`, "roundRect", { left: x, top: 444 + i * 118, width: w, height: 78 }, m[0] === "USER" ? C.pink : C.bg2, m[2], 1.5);
    addText(slide, `chat.msg.text.${i}`, m[1], { left: x + 20, top: 460 + i * 118, width: w - 40, height: 48 }, {
      fontSize: 19,
      color: C.white,
      fill: m[0] === "USER" ? C.pink : C.bg2,
      fontFace: "Noto Sans JP",
    });
  });
  addText(slide, "ai.backend.title", "Backend intelligence", { left: 886, top: 390, width: 620, height: 54 }, {
    fontSize: 44,
    color: C.white,
    bold: true,
    fill: C.bg,
  });
  addBullet(slide, "ai.b1", "Frontend chat state keeps the experience conversational.", 904, 500, 730, C.pink);
  addBullet(slide, "ai.b2", "Backend /api/chat calls Gemini when API key is available.", 904, 590, 730, C.cyan);
  addBullet(slide, "ai.b3", "Fallback responses keep the demo usable even without AI config.", 904, 680, 730, C.gold);
  addBullet(slide, "ai.b4", "Suggested questions guide users toward high-value help.", 904, 770, 730, C.green);
  slide.speakerNotes.text = "Champak shows how the app helps users understand both fantasy rules and streaming setup without leaving the platform.";
}

function slide11(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 11, "Admin Scoring Workflow", "A scoring log turns real event actions into fantasy points", "Admins update player performance, which changes leaderboards through stored fantasy entries.");
  const flow = [
    ["Admin selects player", C.cyan],
    ["Logs action + points", C.gold],
    ["Player total updates", C.pink],
    ["Teams recalculate", C.purple],
    ["Leaderboard shifts", C.green],
  ];
  flow.forEach((f, i) => {
    const x = 124 + i * 336;
    addShape(slide, `admin.step.${i}`, "roundRect", { left: x, top: 458, width: 250, height: 126 }, C.panel, f[1], 2);
    addText(slide, `admin.step.text.${i}`, f[0], { left: x + 22, top: 496, width: 206, height: 56 }, {
      fontSize: 23,
      color: C.white,
      bold: true,
      alignment: "center",
      fill: C.panel,
      fontFace: "Noto Sans JP",
    });
    if (i < flow.length - 1) addArrow(slide, `admin.arrow.${i}`, x + 260, 500, 66, 40, f[1]);
  });
  addShape(slide, "admin.log.panel", "roundRect", { left: 354, top: 704, width: 972, height: 130 }, C.bg2, C.pink, 2);
  addText(slide, "admin.log.text", "PerformanceLog stores playerId, action, pointsAdded, notes, and timestamp.", { left: 400, top: 748, width: 880, height: 46 }, {
    fontSize: 28,
    color: C.text,
    bold: true,
    alignment: "center",
    fill: C.bg2,
    fontFace: "Noto Sans JP",
  });
  slide.speakerNotes.text = "This is the control loop that makes fantasy scoring updateable in a live demo.";
}

function slide12(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 12, "System Architecture", "React UI, Express APIs, real-time services, and data storage", "The stack separates user experience, application logic, live signaling, streaming, AI, and persistence.");
  addNode(slide, "arch.frontend", "React + Vite frontend", "Routes: Dashboard, Match Detail, Create Team, Live, Watch Party, Leaderboard, Admin, Auth", 124, 390, 430, 170, C.cyan);
  addNode(slide, "arch.api", "Express backend", "REST APIs, JWT auth, contest joins, team creation, scoring logs", 746, 390, 430, 170, C.pink);
  addNode(slide, "arch.db", "Prisma + SQLite", "Users, players, matches, contests, teams, entries, logs", 1358, 390, 390, 170, C.gold);
  addArrow(slide, "arch.arrow.1", 580, 452, 128, 42, C.cyan);
  addArrow(slide, "arch.arrow.2", 1202, 452, 128, 42, C.pink);
  addNode(slide, "arch.socket", "Socket.IO", "WebRTC signaling and watch party presence", 328, 682, 360, 130, C.green);
  addNode(slide, "arch.media", "Node Media Server", "RTMP ingest and HTTP-FLV playback", 780, 682, 360, 130, C.red);
  addNode(slide, "arch.ai", "Gemini integration", "AI coach responses through /api/chat", 1232, 682, 360, 130, C.purple);
  addText(slide, "arch.caption", "Production build serves the React app from the backend, with API and live services sharing the same Node server.", { left: 260, top: 852, width: 1300, height: 44 }, {
    fontSize: 24,
    color: C.muted,
    alignment: "center",
    fill: C.bg,
    fontFace: "Noto Sans JP",
  });
  slide.speakerNotes.text = "Talk through frontend, REST backend, database, real-time, streaming, and AI services.";
}

function slide13(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 13, "Database Model", "The schema supports fantasy play around matches and contests", "Prisma models connect users, players, teams, contests, entries, and performance logs.");
  const entities = [
    ["User", "wallet, rank,\ntotalPoints", 128, 390, C.cyan],
    ["FantasyTeam", "theme, budget,\ncaptain, VC", 505, 390, C.pink],
    ["Player", "role, credits,\npoints, team", 505, 670, C.gold],
    ["Match", "sport, teams,\nstatus, deadline", 890, 390, C.green],
    ["Contest", "entryFee,\nspotsLeft, type", 1270, 390, C.red],
    ["ContestEntry", "rank, points,\nteamId, userId", 1270, 670, C.purple],
    ["PerformanceLog", "action,\npointsAdded", 890, 670, C.cyan],
  ];
  entities.forEach(([title, body, x, y, color], i) => addNode(slide, `db.entity.${i}`, title, body, x, y, 280, 132, color));
  const links = [
    [408, 448, 505, 448, C.cyan],
    [785, 448, 890, 448, C.pink],
    [1170, 448, 1270, 448, C.green],
    [1410, 522, 1410, 670, C.red],
    [785, 726, 890, 726, C.gold],
    [1030, 522, 1030, 670, C.green],
  ];
  links.forEach((l, i) => addShape(slide, `db.link.${i}`, "rect", { left: Math.min(l[0], l[2]), top: Math.min(l[1], l[3]), width: Math.max(4, Math.abs(l[2] - l[0]) || 4), height: Math.max(4, Math.abs(l[3] - l[1]) || 4) }, l[4]));
  addText(slide, "db.note", "Key relationship: ContestEntry links the selected FantasyTeam to a Contest and User, enabling rank and points tracking.", { left: 170, top: 846, width: 1380, height: 56 }, {
    fontSize: 24,
    color: C.text,
    bold: true,
    alignment: "center",
    fill: C.bg,
    fontFace: "Noto Sans JP",
  });
  slide.speakerNotes.text = "Use the database model to prove the app has real persistence and relationships, not just UI screens.";
}

function playerGallery(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 14, "Fantasy Player Pool", "Star power makes fantasy feel alive", "The deck now shows recognizable cricket, football, and F1 athletes as the kind of cross-sport pool this platform can support.");
  const cards = [
    ["pool.rohit", "Rohit Sharma", "BAT", "Cricket", A.rohit, C.gold],
    ["pool.virat", "Virat Kohli", "BAT", "Cricket", A.virat, C.pink],
    ["pool.dhoni", "MS Dhoni", "WK", "Cricket", A.dhoni, C.cyan],
    ["pool.messi", "Lionel Messi", "FWD", "Football", A.messi, C.green],
    ["pool.ronaldo", "Cristiano Ronaldo", "FWD", "Football", A.ronaldo, C.red],
    ["pool.haaland", "Erling Haaland", "FWD", "Football", A.haaland, C.cyan],
    ["pool.max", "Max Verstappen", "DRV", "Formula 1", A.max, C.red],
    ["pool.hamilton", "Lewis Hamilton", "DRV", "Formula 1", A.hamilton, C.purple],
  ];
  cards.forEach((c, i) => {
    const x = 110 + (i % 4) * 430;
    const y = 354 + Math.floor(i / 4) * 292;
    addPlayerCard(slide, c[0], c[1], c[2], c[3], c[4], x, y, 250, 250, c[5]);
  });
  addText(slide, "pool.note", "Fantasy value can combine credits, form, popularity, role scarcity, and multiplier potential.", { left: 260, top: 910, width: 1250, height: 44 }, {
    fontSize: 25,
    color: C.text,
    bold: true,
    alignment: "center",
    fill: C.bg,
    fontFace: "Noto Sans JP",
  });
  slide.speakerNotes.text = "Use this slide to make the fantasy domain concrete: the player pool can span real sports and recognizable athletes.";
}

function fantasyAnalysis(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 15, "Fantasy Analysis Layer", "A good fantasy product helps users compare risk and upside", "Analysis visuals translate raw player data into fast decisions: captain choice, credits, form, selection share, and role coverage.");

  addShape(slide, "analysis.matrix", "roundRect", { left: 112, top: 354, width: 660, height: 500 }, C.panel, C.cyan, 2);
  addText(slide, "analysis.matrix.title", "Risk vs Upside Matrix", { left: 150, top: 388, width: 540, height: 42 }, {
    fontSize: 30,
    color: C.cyan,
    bold: true,
    fill: C.panel,
  });
  addShape(slide, "analysis.axis.x", "rect", { left: 190, top: 756, width: 490, height: 3 }, C.muted);
  addShape(slide, "analysis.axis.y", "rect", { left: 190, top: 486, width: 3, height: 270 }, C.muted);
  addText(slide, "analysis.axis.low", "Safer", { left: 186, top: 774, width: 80, height: 24 }, { fontSize: 16, color: C.muted, fill: C.panel, fontFace: "Noto Sans JP" });
  addText(slide, "analysis.axis.high", "Higher upside", { left: 536, top: 774, width: 150, height: 24 }, { fontSize: 16, color: C.muted, fill: C.panel, fontFace: "Noto Sans JP" });
  addText(slide, "analysis.axis.form", "Form", { left: 132, top: 486, width: 64, height: 24 }, { fontSize: 16, color: C.muted, fill: C.panel, fontFace: "Noto Sans JP" });
  const dots = [
    ["Rohit", 330, 610, C.gold],
    ["Messi", 470, 540, C.green],
    ["Max", 560, 500, C.red],
    ["Haaland", 600, 642, C.cyan],
    ["Dhoni", 292, 690, C.pink],
  ];
  dots.forEach(([label, x, y, color], i) => {
    addShape(slide, `analysis.dot.${i}`, "ellipse", { left: x, top: y, width: 28, height: 28 }, color);
    addText(slide, `analysis.dot.label.${i}`, label, { left: x + 36, top: y - 4, width: 110, height: 26 }, {
      fontSize: 16,
      color: C.white,
      fill: C.panel,
      fontFace: "Noto Sans JP",
    });
  });

  const playerRows = [
    ["Max Verstappen", A.max, 9.8, 10.5, "C/VC upside", C.red],
    ["Rohit Sharma", A.rohit, 8.9, 9.5, "Opening impact", C.gold],
    ["Cristiano Ronaldo", A.ronaldo, 8.7, 10.0, "Goal threat", C.green],
    ["Lionel Messi", A.messi, 9.2, 10.0, "Assist + goal", C.cyan],
  ];
  playerRows.forEach((row, i) => {
    const y = 354 + i * 124;
    addPhoto(slide, `analysis.${i}.photo`, row[1], 876, y, 92, 92, row[5]);
    addText(slide, `analysis.${i}.name`, row[0], { left: 992, top: y + 2, width: 300, height: 30 }, {
      fontSize: 24,
      color: C.white,
      bold: true,
      fill: C.bg,
      fontFace: "Noto Sans JP",
    });
    addText(slide, `analysis.${i}.tag`, row[4], { left: 992, top: y + 38, width: 260, height: 24 }, {
      fontSize: 16,
      color: row[5],
      bold: true,
      fill: C.bg,
      fontFace: "Noto Sans JP",
    });
    addShape(slide, `analysis.${i}.form.bg`, "rect", { left: 1290, top: y + 10, width: 260, height: 16 }, "#302B44");
    addShape(slide, `analysis.${i}.form`, "rect", { left: 1290, top: y + 10, width: row[2] * 24, height: 16 }, row[5]);
    addText(slide, `analysis.${i}.form.label`, `Form ${row[2]}`, { left: 1568, top: y + 2, width: 110, height: 28 }, {
      fontSize: 17,
      color: C.text,
      fill: C.bg,
      fontFace: "Noto Sans JP",
    });
    addShape(slide, `analysis.${i}.credit.bg`, "rect", { left: 1290, top: y + 58, width: 260, height: 16 }, "#302B44");
    addShape(slide, `analysis.${i}.credit`, "rect", { left: 1290, top: y + 58, width: row[3] * 22, height: 16 }, C.pink);
    addText(slide, `analysis.${i}.credit.label`, `Credits ${row[3]}`, { left: 1568, top: y + 50, width: 130, height: 28 }, {
      fontSize: 17,
      color: C.text,
      fill: C.bg,
      fontFace: "Noto Sans JP",
    });
  });

  addText(slide, "analysis.caption", "Analysis images to include in a future product: ownership heatmaps, captain-risk radar, credits-vs-form scatter, and matchup trend cards.", { left: 176, top: 900, width: 1420, height: 48 }, {
    fontSize: 23,
    color: C.muted,
    alignment: "center",
    fill: C.bg,
    fontFace: "Noto Sans JP",
  });
  slide.speakerNotes.text = "This slide shows the kind of analysis layer that makes player selection more strategic and presentation-friendly.";
}

function slide14(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 16, "Tech Stack", "Modern web stack with real-time and media capabilities", "The implementation combines frontend polish with backend services that make live interaction possible.");
  addSimpleTable(slide, "stack.table", ["Layer", "Technology", "Purpose"], [
    ["Frontend", "React 19, Vite, React Router, lucide-react", "Interactive pages, navigation, icons"],
    ["Visuals", "Three.js, @react-three/fiber, CSS effects", "Futuristic animated interface"],
    ["Backend", "Express, Node.js, CORS", "API routes and production serving"],
    ["Data", "Prisma, SQLite", "Models, persistence, seed data"],
    ["Realtime", "Socket.IO, WebRTC", "Presence and browser screen sharing"],
    ["Streaming", "Node Media Server, flv.js", "OBS ingest and FLV playback"],
    ["AI", "Google Generative AI", "Champak coach responses"],
  ], 154, 354, [230, 560, 660], 70, C.cyan);
  addText(slide, "stack.close", "The stack is intentionally demo-friendly: local database, local media server, and browser-first flows.", { left: 270, top: 882, width: 1180, height: 44 }, {
    fontSize: 24,
    color: C.muted,
    alignment: "center",
    fill: C.bg,
    fontFace: "Noto Sans JP",
  });
  slide.speakerNotes.text = "Close the technical portion by explaining each layer in language a review panel can follow.";
}

function slide15(presentation) {
  const slide = presentation.slides.add();
  addSlideTitle(slide, 17, "Future Scope", "The foundation is ready for richer campus-scale play", "The next version can focus on reliability, richer scoring, and broader event support.");
  const roadmap = [
    ["1", "Mobile-first refinement", "Responsive drafting and live watch party controls.", C.cyan],
    ["2", "Advanced scoring rules", "Sport-specific points, substitutions, penalties, and bonuses.", C.gold],
    ["3", "Payments or rewards", "Wallet top-ups, badges, certificates, and sponsor prizes.", C.green],
    ["4", "Moderation and roles", "Separate admin, streamer, organizer, and user permissions.", C.pink],
    ["5", "Deployment hardening", "Environment secrets, persistent database, logs, and monitoring.", C.red],
  ];
  roadmap.forEach((r, i) => {
    const y = 360 + i * 105;
    addShape(slide, `future.num.${i}`, "ellipse", { left: 164, top: y, width: 68, height: 68 }, r[3]);
    addText(slide, `future.num.text.${i}`, r[0], { left: 181, top: y + 12, width: 34, height: 36 }, {
      fontSize: 26,
      color: C.bg,
      bold: true,
      alignment: "center",
      fill: r[3],
    });
    addText(slide, `future.title.${i}`, r[1], { left: 270, top: y - 2, width: 520, height: 38 }, {
      fontSize: 28,
      color: C.white,
      bold: true,
      fill: C.bg,
    });
    addText(slide, `future.body.${i}`, r[2], { left: 270, top: y + 42, width: 1030, height: 38 }, {
      fontSize: 21,
      color: C.muted,
      fill: C.bg,
      fontFace: "Noto Sans JP",
    });
  });
  addShape(slide, "future.final", "roundRect", { left: 1296, top: 398, width: 360, height: 310 }, C.panel, C.pink, 3);
  addText(slide, "future.final.text", "IIITN Fantasy Arena turns events into participation.", { left: 1334, top: 482, width: 284, height: 132 }, {
    fontSize: 32,
    color: C.white,
    bold: true,
    alignment: "center",
    fill: C.panel,
    lineSpacing: 1.02,
  });
  addText(slide, "future.thanks", "Thank you", { left: 1280, top: 748, width: 390, height: 64 }, {
    fontSize: 42,
    color: C.cyan,
    bold: true,
    alignment: "center",
    fill: C.bg,
  });
  slide.speakerNotes.text = "End with future scope and a simple conclusion: the project brings participation to campus events.";
}

async function saveBlob(blob, path) {
  const fs = await import("node:fs/promises");
  await fs.writeFile(path, Buffer.from(await blob.arrayBuffer()));
}

export async function build(artifact) {
  const fs = await import("node:fs/promises");
  const { Presentation, PresentationFile } = artifact;
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  await fs.mkdir("C:/Users/AARYAN/pratice/presentation/output", { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  [
    cover,
    slide2,
    slide3,
    slide4,
    slide5,
    slide6,
    slide7,
    slide8,
    slide9,
    slide10,
    slide11,
    slide12,
    slide13,
    playerGallery,
    fantasyAnalysis,
    slide14,
    slide15,
  ].forEach((fn) => fn(presentation));

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(OUT);

  const previewPaths = [];
  for (const [i, slide] of presentation.slides.items.entries()) {
    const png = await slide.export({ format: "png", scale: 1 });
    const previewPath = `${PREVIEW_DIR}/slide-${String(i + 1).padStart(2, "0")}.png`;
    await saveBlob(png, previewPath);
    previewPaths.push(previewPath);
  }

  const inspect = await presentation.inspect({ kind: "slide,textbox,shape,table,chart,image,notes", include: "bbox,textPreview,textChars,textLines" });
  await fs.writeFile(INSPECT, JSON.stringify(inspect, null, 2));

  const report = {
    deck: OUT,
    previews: previewPaths,
    inspect: INSPECT,
    slideCount: previewPaths.length,
    notes: [
      "Deck authored with editable PowerPoint-native shapes and text.",
      "No screenshot-only slides were used.",
      "Source material came from the local IIITN fantasy platform project.",
    ],
  };
  await fs.writeFile(REPORT, JSON.stringify(report, null, 2));
  return report;
}
