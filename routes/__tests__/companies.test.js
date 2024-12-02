const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

beforeEach(async () => {
  await db.query("DELETE FROM companies");
  await db.query(
    `INSERT INTO companies (code, name, description)
     VALUES ('test', 'Test Company', 'A test company')`
  );
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Gets a list of companies", async () => {
    const response = await request(app).get("/companies");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies: [{ code: "test", name: "Test Company" }]
    });
  });
});

describe("GET /companies/:code", () => {
  test("Gets a single company", async () => {
    const response = await request(app).get("/companies/test");
    expect(response.statusCode).toBe(200);
    expect(response.body.company.code).toEqual("test");
  });

  test("Responds with 404 for invalid company", async () => {
    const response = await request(app).get("/companies/notreal");
    expect(response.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("Creates a new company", async () => {
    const response = await request(app)
      .post("/companies")
      .send({
        name: "New Company",
        description: "A new company for testing"
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.company.name).toEqual("New Company");
  });
});

describe("PUT /companies/:code", () => {
  test("Updates a company", async () => {
    const response = await request(app)
      .put("/companies/test")
      .send({
        name: "Updated Company",
        description: "Updated description"
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.company.name).toEqual("Updated Company");
  });

  test("Responds with 404 for invalid company", async () => {
    const response = await request(app)
      .put("/companies/notreal")
      .send({
        name: "Updated Company",
        description: "Updated description"
      });
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
  test("Deletes a company", async () => {
    const response = await request(app).delete("/companies/test");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "deleted" });
  });

  test("Responds with 404 for invalid company", async () => {
    const response = await request(app).delete("/companies/notreal");
    expect(response.statusCode).toBe(404);
  });
}); 