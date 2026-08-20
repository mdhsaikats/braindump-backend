import http from "k6/http";
import { check, fail, sleep } from "k6";

// Required for protected-route testing:
//   k6 run -e TEST_EMAIL=user@example.com -e TEST_PASSWORD=secret tests/test.js
// Or pass an existing JWT: k6 run -e TEST_TOKEN=your-jwt tests/test.js
// Never enable write tests against production: they create and delete test data.
const baseUrl = (__ENV.BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const maxVus = Number(__ENV.MAX_VUS || 50);
const writeTests = __ENV.RUN_WRITE_TESTS === "true";
const registerTests = __ENV.RUN_REGISTER_TESTS === "true";
const jsonHeaders = { "Content-Type": "application/json" };

export const options = {
  stages: [
    { duration: __ENV.RAMP_UP || "15s", target: maxVus },
    { duration: __ENV.HOLD || "30s", target: maxVus },
    { duration: __ENV.RAMP_DOWN || "15s", target: 0 },
  ],
  thresholds: {
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

function assertSuccess(response, name, expectedStatus = 200) {
  check(response, {
    [`${name}: expected status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${name}: response under 500ms`]: (r) => r.timings.duration < 500,
  });
}

export function setup() {
  if (registerTests) {
    const suffix = Date.now();
    const response = http.post(`${baseUrl}/api/v1/auth/register`, JSON.stringify({
      username: `k6-user-${suffix}`,
      email: `k6-user-${suffix}@example.invalid`,
      password: "k6-load-test-password",
    }), { headers: jsonHeaders, tags: { endpoint: "auth-register" } });
    assertSuccess(response, "register", 201);
  }

  if (__ENV.TEST_TOKEN) return { token: __ENV.TEST_TOKEN };
  if (!__ENV.TEST_EMAIL || !__ENV.TEST_PASSWORD) {
    fail("Set TEST_TOKEN or both TEST_EMAIL and TEST_PASSWORD to test protected APIs.");
  }

  const response = http.post(
    `${baseUrl}/api/v1/auth/login`,
    JSON.stringify({ email: __ENV.TEST_EMAIL, password: __ENV.TEST_PASSWORD }),
    { headers: jsonHeaders, tags: { endpoint: "auth-login" } },
  );
  assertSuccess(response, "login");
  const token = response.json("token");
  if (!token) fail("Login succeeded without returning a token.");
  return { token };
}

export default function ({ token }) {
  const headers = { Authorization: `Bearer ${token}` };
  const readResponses = http.batch([
    ["GET", `${baseUrl}/api/v1/health`, null, { tags: { endpoint: "health" } }],
    ["GET", `${baseUrl}/api/v1/users/profile`, null, { headers, tags: { endpoint: "profile" } }],
    ["GET", `${baseUrl}/api/v1/users/idea`, null, { headers, tags: { endpoint: "ideas" } }],
    ["GET", `${baseUrl}/api/v1/users/ideas/search?q=test`, null, { headers, tags: { endpoint: "ideas-search" } }],
    ["GET", `${baseUrl}/api/v1/users/idea/search?q=test`, null, { headers, tags: { endpoint: "idea-search" } }],
    ["GET", `${baseUrl}/api/v1/users/my-ideas`, null, { headers, tags: { endpoint: "my-ideas" } }],
    ["GET", `${baseUrl}/api/v1/users/saves`, null, { headers, tags: { endpoint: "saved-ideas" } }],
  ]);
  const names = ["health", "profile", "ideas", "ideas search", "idea search", "my ideas", "saves"];
  readResponses.forEach((response, index) => assertSuccess(response, names[index]));
  if (writeTests) runWriteTests(headers, readResponses[1].json("data"));
  sleep(1);
}

function runWriteTests(headers, profile) {
  const suffix = `${__VU}-${__ITER}-${Date.now()}`;
  const params = { headers: { ...headers, ...jsonHeaders } };
  const create = http.post(`${baseUrl}/api/v1/users/idea`, JSON.stringify({
    title: `k6 test ${suffix}`, description: "Temporary load-test idea", tags: ["k6"],
  }), { ...params, tags: { endpoint: "create-idea" } });
  assertSuccess(create, "create idea", 201);
  const ideaId = create.json("idea.id");
  if (!ideaId) return;

  // Exercise profile update without leaving the supplied test account changed.
  if (profile?.username && profile?.email) {
    assertSuccess(http.patch(`${baseUrl}/api/v1/users/update`, JSON.stringify({
      username: profile.username, email: profile.email, bio: profile.bio,
    }), { ...params, tags: { endpoint: "update-profile" } }), "update profile");
  }

  assertSuccess(http.patch(`${baseUrl}/api/v1/users/idea/update`, JSON.stringify({
    idea_id: ideaId, title: `k6 updated ${suffix}`,
  }), { ...params, tags: { endpoint: "update-idea" } }), "update idea");
  assertSuccess(http.post(`${baseUrl}/api/v1/users/idea/${ideaId}/like`, null,
    { headers, tags: { endpoint: "like-idea" } }), "like idea");
  assertSuccess(http.post(`${baseUrl}/api/v1/users/saves/${ideaId}`, null,
    { headers, tags: { endpoint: "save-idea" } }), "save idea");
  assertSuccess(http.del(`${baseUrl}/api/v1/users/saves/${ideaId}`, null,
    { headers, tags: { endpoint: "unsave-idea" } }), "unsave idea");
  assertSuccess(http.del(`${baseUrl}/api/v1/users/idea/${ideaId}`, null,
    { headers, tags: { endpoint: "delete-idea" } }), "delete idea");
}
