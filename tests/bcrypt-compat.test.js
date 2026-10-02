// bcrypt (native) was swapped for bcryptjs: the prebuilt .node binary is x86_64
// and this Mac is arm64, with no working Xcode CLT to rebuild it.
// This asserts bcryptjs still produces/accepts canonical bcrypt hashes, so the
// password hashes already in Atlas keep verifying.
const assert = require("assert");
const bcrypt = require("bcryptjs");

// Canonical OpenBSD/jBCrypt vectors: [plaintext, salt, expected hash]
const VECTORS = [
  ["", "$2a$06$DCq7YPn5Rq63x1Lad4cll.", "$2a$06$DCq7YPn5Rq63x1Lad4cll.TV4S6ytwfsfvkgY8jIucDrjc8deX1s."],
  ["a", "$2a$06$m0CrhHm10qJ3lXRY.5zDGO", "$2a$06$m0CrhHm10qJ3lXRY.5zDGO3rS2KdeeWLuGmsfGlMfOxih58VYVfxe"],
  ["abc", "$2a$06$If6bvum7DFjUnE9p2uDeDu", "$2a$06$If6bvum7DFjUnE9p2uDeDu0YHzrHM6tf.iqN8.yx.jNN1ILEf7h0i"],
];

for (const [plain, salt, expected] of VECTORS) {
  assert.strictEqual(bcrypt.hashSync(plain, salt), expected, `hash mismatch for ${JSON.stringify(plain)}`);
  assert.ok(bcrypt.compareSync(plain, expected), `compare failed for ${JSON.stringify(plain)}`);
  assert.ok(!bcrypt.compareSync(plain + "x", expected), `compare accepted a wrong password`);
}

// The salt rounds the app actually uses must round-trip.
const h = bcrypt.hashSync("s3cret", Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
assert.ok(bcrypt.compareSync("s3cret", h));
assert.ok(!bcrypt.compareSync("s3cre", h));

console.log("bcrypt-compat: ok");
