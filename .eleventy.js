module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });

  // unique tags across all artworks, alphabetical — feeds the archive filter chips
  eleventyConfig.addCollection("tags", (api) => {
    const artworks = api.getAll()[0]?.data.artworks || [];
    const tagSet = new Set();
    artworks.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  });

  // unique years, newest first — feeds the archive date chips
  eleventyConfig.addCollection("years", (api) => {
    const artworks = api.getAll()[0]?.data.artworks || [];
    const yearSet = new Set(artworks.map((a) => a.year));
    return [...yearSet].sort((a, b) => b - a);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
