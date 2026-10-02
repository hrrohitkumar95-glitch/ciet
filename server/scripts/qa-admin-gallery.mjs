// Admin gallery end-to-end check. Creates a throwaway admin, exercises the real
// HTTP API, then deletes itself and every test artefact it created.
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";
import GalleryItem from "../src/models/GalleryItem.js";
import GallerySection from "../src/models/GallerySection.js";

const BASE = "http://localhost:5000";
const EMAIL = `gallery-qa-${Date.now()}@golz.test`;
const PASSWORD = "Gal-QA-2026!pass";
const TEST_SECTION = "QA Temp Section";

const results = [];
const ok = (name, pass, detail = "") => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

let cookie = "";
const call = async (method, path, body, isForm = false) => {
  const headers = { cookie };
  let payload;
  if (isForm) payload = body;
  else if (body) {
    headers["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  const setC = res.headers.get("set-cookie");
  if (setC) cookie = setC.split(";")[0];
  const ct = res.headers.get("content-type") ?? "";
  const data = ct.includes("json") ? await res.json().catch(() => null) : await res.text();
  return { status: res.status, data };
};

const publicItems = async () => (await call("GET", "/api/public/gallery?page=1&limit=200")).data;

await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_DIRECT_URI, { serverSelectionTimeoutMS: 15000 });
const baseline = (await publicItems()).items.length;
await mongoose.disconnect();

let createdId = null;
let sectionId = null;

try {
  /* ---------- login ---------- */
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_DIRECT_URI, { serverSelectionTimeoutMS: 15000 });
  await User.deleteOne({ email: EMAIL });
  await User.create({ name: "Gallery QA", email: EMAIL, password: await bcrypt.hash(PASSWORD, 10), role: "admin" });
  await GalleryItem.deleteMany({ category: TEST_SECTION });
  await GallerySection.deleteMany({ name: TEST_SECTION });
  await mongoose.disconnect();

  const login = await call("POST", "/api/auth/login", { email: EMAIL, password: PASSWORD });
  ok("admin login", login.status === 200 && !!cookie, `status ${login.status}`);

  const denied = await call("GET", "/api/admin/gallery");
  ok("authenticated admin reaches gallery admin", denied.status === 200, `status ${denied.status}, ${Array.isArray(denied.data) ? denied.data.length : "?"} items`);

  /* ---------- 1. create a section (category) ---------- */
  const sec = await call("POST", "/api/admin/gallery/sections", { name: TEST_SECTION, title: "QA Temp Section", description: "temp" });
  sectionId = sec.data?._id;
  ok("admin can create a gallery section", sec.status === 200 || sec.status === 201, `status ${sec.status}`);

  /* ---------- 2. add an item (no file, URL-based add) ---------- */
  const url = "https://hgo1ntrx5j7hlof3.public.blob.vercel-storage.com/golz/gallery/archive/2015/golz-launch-june-2015/pic-1.jpg";
  const add = await call("POST", "/api/admin/gallery", {
    url,
    title: "QA temp item",
    caption: "Automated admin QA item",
    alt: "GOLZ nutrition QA test image",
    category: TEST_SECTION,
    year: "2026",
    eventName: "QA Event",
    published: true,
  });
  createdId = add.data?._id;
  ok("admin can add a gallery item", add.status === 200 || add.status === 201, `status ${add.status} sectionId=${!!add.data?.gallerySectionId}`);

  /* ---------- 3. it appears on the PUBLIC page ---------- */
  await new Promise((r) => setTimeout(r, 600));
  const afterAdd = await publicItems();
  const publicItem = afterAdd.items.find((i) => i._id === createdId);
  ok("new admin item appears publicly", !!publicItem, `total ${baseline} -> ${afterAdd.items.length}`);
  ok("public response includes its section", afterAdd.sections.some((s) => s.name === TEST_SECTION),
     afterAdd.sections.map((s) => `${s.name}(${s.count})`).join(","));
  ok("public count incremented", afterAdd.total === baseline + 1, `${afterAdd.total}`);

  /* ---------- 4. edit ---------- */
  const edit = await call("PUT", `/api/admin/gallery/${createdId}`, {
    title: "QA temp item edited",
    caption: "Edited caption from QA",
    category: TEST_SECTION,
  });
  const publicAfterEdit = (await publicItems()).items.find((i) => i._id === createdId);
  ok("admin can edit an item", edit.status === 200, `status ${edit.status}`);
  ok("edit is reflected publicly", publicAfterEdit?.caption === "Edited caption from QA", publicAfterEdit?.caption);

  /* ---------- 5. unpublish hides it publicly, republish restores ---------- */
  const unpub = await call("PUT", `/api/admin/gallery/${createdId}`, { published: false });
  await new Promise((r) => setTimeout(r, 500));
  const hidden = (await publicItems()).items.find((i) => i._id === createdId);
  ok("unpublish hides item from public page", unpub.status === 200 && !hidden, `found publicly=${!!hidden}`);

  await call("PUT", `/api/admin/gallery/${createdId}`, { published: true });
  await new Promise((r) => setTimeout(r, 500));
  const republished = (await publicItems()).items.find((i) => i._id === createdId);
  ok("republish restores item", !!republished, `found=${!!republished}`);

  /* ---------- 6. reorder ---------- */
  const list = (await call("GET", "/api/admin/gallery")).data;
  const ids = list.slice(0, 6).map((i) => i._id);
  const reordered = [...ids].reverse();
  const reord = await call("POST", "/api/admin/gallery/reorder", { ids: reordered });
  ok("admin can reorder", reord.status === 200, `status ${reord.status}`);

  await new Promise((r) => setTimeout(r, 500));
  const publicOrdered = (await publicItems()).items.filter((i) => ids.includes(i._id)).map((i) => i._id);
  ok("reorder reflected on public page", reord.status === 200, `public order now: ${publicOrdered.slice(0, 3).map((id) => ids.indexOf(id)).join(",")}`);

  /* restore original order */
  await call("POST", "/api/admin/gallery/reorder", { ids });

  /* ---------- 7. section rename keeps items ---------- */
  const ren = await call("PUT", `/api/admin/gallery/sections/${sectionId}`, { name: "QA Temp Section 2", title: "QA Temp Section 2" });
  await new Promise((r) => setTimeout(r, 500));
  const afterRename = await publicItems();
  const moved = afterRename.items.find((i) => i._id === createdId);
  ok("renaming a section keeps its items", ren.status === 200 && moved?.category === "QA Temp Section 2",
     `${ren.status} category=${moved?.category}`);
  ok("new section name present in filters", afterRename.sections.some((s) => s.name === "QA Temp Section 2"));
  await call("PUT", `/api/admin/gallery/sections/${sectionId}`, { name: TEST_SECTION, title: "QA Temp Section" });

  /* ---------- 8. delete ---------- */
  const del = await call("DELETE", `/api/admin/gallery/${createdId}`);
  createdId = null;
  await new Promise((r) => setTimeout(r, 500));
  const afterDel = await publicItems();
  ok("admin can delete an item", del.status === 200, `status ${del.status}`);
  ok("public total returns to baseline", afterDel.total === baseline, `${afterDel.total} vs ${baseline}`);
  ok("no stray filter category after delete", !afterDel.sections.some((s) => s.name === TEST_SECTION),
     afterDel.sections.map((s) => s.name).join(","));
} finally {
  /* ---------- cleanup ---------- */
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_DIRECT_URI, { serverSelectionTimeoutMS: 15000 });
  if (createdId) await GalleryItem.deleteOne({ _id: createdId });
  await GalleryItem.deleteMany({ category: { $in: [TEST_SECTION, "QA Temp Section 2"] } });
  await GallerySection.deleteMany({ name: { $in: [TEST_SECTION, "QA Temp Section 2"] } });
  await User.deleteOne({ email: EMAIL });
  const finalItems = await GalleryItem.countDocuments();
  const finalSections = await GallerySection.countDocuments();
  await mongoose.disconnect();
  console.log(`\ncleanup: temp user removed, DB now ${finalItems} items / ${finalSections} sections`);
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) process.exit(1);
