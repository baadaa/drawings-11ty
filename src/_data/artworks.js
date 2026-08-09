const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const Image = require("@11ty/eleventy-img");

const ARTWORKS_DIR = path.join(__dirname, "..", "artworks");

// thumbnail + full-size widths generated for every image.
// adjust once your real scans are in — these are placeholder sizes.
const THUMB_WIDTH = 600;
const FULL_WIDTHS = [1200, 2000];

async function processImage(srcPath, urlSlug) {
  const metadata = await Image(srcPath, {
    widths: [THUMB_WIDTH, ...FULL_WIDTHS],
    formats: ["webp", "jpeg"],
    outputDir: "./_site/img/",
    urlPath: "/img/",
    filenameFormat: (id, src, width, format) => {
      const name = path.basename(src, path.extname(src));
      return `${urlSlug}-${name}-${width}.${format}`;
    },
  });

  // webp is preferred; jpeg is the fallback array — pull dimensions from either,
  // they're identical since eleventy-img derives them from the source file.
  const widest = metadata.jpeg[metadata.jpeg.length - 1];
  const thumb = metadata.webp.find((e) => e.width === THUMB_WIDTH) || metadata.webp[0];

  return {
    width: widest.width,
    height: widest.height,
    aspectRatio: widest.width / widest.height,
    thumb: {
      webp: (metadata.webp.find((e) => e.width === THUMB_WIDTH) || metadata.webp[0]).url,
      jpeg: (metadata.jpeg.find((e) => e.width === THUMB_WIDTH) || metadata.jpeg[0]).url,
    },
    full: {
      webp: metadata.webp.map((e) => ({ url: e.url, width: e.width })),
      jpeg: metadata.jpeg.map((e) => ({ url: e.url, width: e.width })),
      srcset: metadata.webp.map((e) => `${e.url} ${e.width}w`).join(", "),
    },
    filename: path.basename(srcPath),
  };
}

module.exports = async function () {
  const slugs = fs
    .readdirSync(ARTWORKS_DIR)
    .filter((f) => fs.statSync(path.join(ARTWORKS_DIR, f)).isDirectory());

  const artworks = await Promise.all(
    slugs.map(async (slug) => {
      const dir = path.join(ARTWORKS_DIR, slug);
      const meta = yaml.load(fs.readFileSync(path.join(dir, "meta.yaml"), "utf8"));

      const imgDir = path.join(dir, "img");
      const sourceFiles = fs
        .readdirSync(imgDir)
        .filter((f) => /\.(jpe?g|png)$/i.test(f))
        .sort(); // source-01.jpg before source-02.jpg, etc.

      const images = await Promise.all(
        sourceFiles.map((f) => processImage(path.join(imgDir, f), slug))
      );

      const isCollection = images.length > 1;
      const coverImage = meta.cover
        ? images.find((img) => img.filename === meta.cover)
        : images[0];

      const date = new Date(meta.date);

      return {
        slug,
        title: meta.title || "Untitled",
        date,
        year: date.getFullYear(),
        tags: meta.tags || [],
        medium: meta.medium || null,
        isCollection,
        count: images.length,
        cover: coverImage,
        images, // full ordered list — used by the overlay for collection nav
      };
    })
  );

  // newest first
  artworks.sort((a, b) => b.date - a.date);
  return artworks;
};
