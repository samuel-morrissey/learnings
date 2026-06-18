"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const { renderCoursePage, renderHub } = require("./build.js");

// A plain model course, the shape buildSiteModel produces. Render functions
// take data, never the filesystem, so these tests need no temp dirs.
function aCourse(overrides = {}) {
  return {
    name: "aws",
    title: "AWS Certified Cloud Practitioner (CLF-C02)",
    lessonCount: 2,
    lessons: [
      { slug: "0001-intro", file: "0001-intro.html", title: "Intro" },
      { slug: "0002-ec2", file: "0002-ec2.html", title: "EC2" },
    ],
    ...overrides,
  };
}

test("course page shows the course title and links each lesson in order", () => {
  const html = renderCoursePage(aCourse());

  assert.match(html, /AWS Certified Cloud Practitioner \(CLF-C02\)/);
  assert.match(html, /href="lessons\/0001-intro\.html"/);
  assert.match(html, /href="lessons\/0002-ec2\.html"/);
  assert.ok(
    html.indexOf("0001-intro.html") < html.indexOf("0002-ec2.html"),
    "lessons should appear in model order"
  );
  assert.match(html, />Intro</);
  assert.match(html, />EC2</);
});

test("course page renders the lessons as a numbered list", () => {
  const html = renderCoursePage(aCourse());

  assert.match(html, /<ol>[\s\S]*<\/ol>/);
});

test("course page has a back link to the hub", () => {
  const html = renderCoursePage(aCourse());

  // The hub lives two levels up from /courses/<name>/index.html.
  assert.match(html, /href="\.\.\/\.\.\/"/);
});

function aModel() {
  return {
    courses: [
      aCourse(),
      aCourse({
        name: "kubernetes",
        title: "Kubernetes",
        lessonCount: 1,
        lessons: [{ slug: "0001-pods", file: "0001-pods.html", title: "Pods" }],
      }),
    ],
  };
}

test("hub links each course to its course page with title and lesson count", () => {
  const html = renderHub(aModel());

  assert.match(html, /href="courses\/aws\/"/);
  assert.match(html, /href="courses\/kubernetes\/"/);
  assert.match(html, /AWS Certified Cloud Practitioner \(CLF-C02\)[\s\S]*·[\s\S]*2 aulas/);
  assert.match(html, /Kubernetes[\s\S]*·[\s\S]*1 aula(?!s)/);
});

test("hub no longer lists individual lessons inline", () => {
  const html = renderHub(aModel());

  assert.doesNotMatch(html, /lessons\//);
});
