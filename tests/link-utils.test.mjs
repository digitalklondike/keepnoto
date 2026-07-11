import test from "node:test";
import assert from "node:assert/strict";

import {
  formatRelativeDate,
  getPlatformNameFromUrl,
  isLikelyUrl,
  linkMatchesQuery,
  parseSavedLinkUrl,
  selectVisibleLink,
  sortLinksByDateOrTitle,
} from "../lib/link-utils.ts";

const searchableLink = {
  title: "Supabase Auth",
  domain: "supabase.com/docs/auth",
  source: "supabase.com",
  description: "Authentication documentation",
  savedReason: "The refresh token explanation finally clicked",
  previewTitle: "Auth | Supabase Docs",
  previewDescription: "Build authentication flows",
  type: "Article",
  collection: null,
  tags: ["auth", "docs"],
};

test("normalizes valid web links and rejects unsafe protocols", () => {
  assert.equal(parseSavedLinkUrl("supabase.com/docs/auth").href, "https://supabase.com/docs/auth");
  assert.equal(isLikelyUrl("https://skills.sh"), true);
  assert.equal(isLikelyUrl("javascript:alert(1)"), false);
  assert.throws(() => parseSavedLinkUrl("not a url"));
});

test("derives a readable platform name", () => {
  assert.equal(getPlatformNameFromUrl("https://youtube.com/watch?v=1"), "YouTube");
  assert.equal(getPlatformNameFromUrl("https://my-useful-tool.dev"), "My Useful Tool");
});

test("search includes the saved reason", () => {
  assert.equal(linkMatchesQuery(searchableLink, "refresh token"), true);
  assert.equal(linkMatchesQuery(searchableLink, "unrelated phrase"), false);
});

test("sorts by raw timestamps instead of array position", () => {
  const links = [
    { title: "Middle", createdAt: "2026-07-10T12:00:00.000Z" },
    { title: "Newest", createdAt: "2026-07-11T12:00:00.000Z" },
    { title: "Oldest", createdAt: "2026-07-09T12:00:00.000Z" },
  ];

  assert.deepEqual(sortLinksByDateOrTitle(links, "oldest").map(({ title }) => title), ["Oldest", "Middle", "Newest"]);
  assert.deepEqual(sortLinksByDateOrTitle(links, "recent").map(({ title }) => title), ["Newest", "Middle", "Oldest"]);
});

test("formats relative dates against a supplied clock", () => {
  const now = new Date("2026-07-11T12:00:00.000Z").getTime();
  assert.equal(formatRelativeDate("2026-07-11T11:59:30.000Z", now), "Just now");
  assert.equal(formatRelativeDate("2026-07-09T12:00:00.000Z", now), "2 days ago");
});

test("never falls back to a link outside the visible result set", () => {
  const visibleLinks = [{ id: "visible" }];

  assert.deepEqual(selectVisibleLink(visibleLinks, "hidden"), { id: "visible" });
  assert.equal(selectVisibleLink([], "hidden"), undefined);
});
