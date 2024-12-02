const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

// ... existing routes ...

// Updated POST route
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, { lower: true, strict: true });
    const result = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Updated GET /:code route
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const compResult = await db.query(
      `SELECT c.code, c.name, c.description,
              ARRAY_AGG(i.industry) AS industries
       FROM companies AS c
       LEFT JOIN company_industries AS ci
       ON c.code = ci.comp_code
       LEFT JOIN industries AS i
       ON ci.ind_code = i.code
       WHERE c.code = $1
       GROUP BY c.code, c.name, c.description`,
      [code]
    );

    if (compResult.rows.length === 0) {
      throw new ExpressError(`Company with code ${code} not found`, 404);
    }

    return res.json({ company: compResult.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// ... rest of routes ... 