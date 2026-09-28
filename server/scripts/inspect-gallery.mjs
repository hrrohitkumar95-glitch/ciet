import "dotenv/config";
import mongoose from "mongoose";

const GallerySection =
  mongoose.models.GallerySection ||
  mongoose.model(
    "GallerySection",
    new mongoose.Schema(
      {
        name: String,
        title: String,
        description: String,
        cover: String,
        order: Number,
        published: Boolean,
      },
      { collection: "gallerysections", timestamps: true }
    )
  );

const GalleryItem =
  mongoose.models.GalleryItem ||
  mongoose.model(
    "GalleryItem",
    new mongoose.Schema(
      {
        type: String,
        url: String,
        thumb: String,
        category: String,
        gallerySectionId: mongoose.Schema.Types.ObjectId,
        caption: String,
        description: String,
        alt: String,
        order: Number,
        featured: Boolean,
        published: Boolean,
      },
      { collection: "galleryitems", timestamps: true }
    )
  );

const Media =
  mongoose.models.Media ||
  mongoose.model(
    "Media",
    new mongoose.Schema(
      {
        filename: String,
        url: String,
        thumb: String,
        storage: String,
        storageKey: String,
        assetId: String,
        resourceType: String,
        contentType: String,
        size: Number,
        uploadedBy: String,
        gallerySectionId: String,
      },
      { collection: "media", timestamps: true }
    )
  );

await mongoose.connect(process.env.MONGO_DIRECT_URI || process.env.MONGO_URI);
const dbName = mongoose.connection.name;
console.log("=== CONNECTED ===");
console.log("db:", dbName, "host:", mongoose.connection.host);

const sections = await GallerySection.find({}).sort({ order: 1 }).lean();
console.log("\n=== GALLERY SECTIONS (%d) ===", sections.length);
for (const s of sections) {
  const count = await GalleryItem.countDocuments({ category: s.name });
  console.log(
    `order=${s.order} name="${s.name}" title="${s.title}" published=${s.published} itemsByCategory=${count} cover=${s.cover ? "yes" : "no"}`
  );
}

const items = await GalleryItem.find({}).sort({ order: 1 }).lean();
console.log("\n=== GALLERY ITEMS (%d) ===", items.length);
const byCat = {};
for (const i of items) {
  byCat[i.category] = (byCat[i.category] || 0) + 1;
}
console.log("counts by category:", JSON.stringify(byCat, null, 2));
console.log("\nfirst 5 items:");
items.slice(0, 5).forEach((i) => {
  console.log(
    `  order=${i.order} cat="${i.category}" published=${i.published} featured=${i.featured} caption="${i.caption}" url=${String(i.url).slice(0, 90)}`
  );
});

const cats = await GalleryItem.distinct("category");
console.log("\ndistinct categories:", JSON.stringify(cats));

const mediaCount = await Media.countDocuments({});
console.log("media records:", mediaCount);

const dupNames = await GallerySection.aggregate([
  { $group: { _id: { $toLower: "$name" }, n: { $sum: 1 } } },
  { $match: { n: { $gt: 1 } } },
]);
console.log("duplicate section names (case-insensitive):", JSON.stringify(dupNames));

await mongoose.disconnect();
process.exit(0);
