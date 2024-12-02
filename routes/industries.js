const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET /industries - list all industries with their companies
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT i.code, i.industry, 
              ARRAY_AGG(c.code) AS company_codes
       FROM industries AS i
       LEFT JOIN company_industries AS ci
       ON i.code = ci.ind_code
       LEFT JOIN companies AS c
       ON ci.comp_code = c.code
       GROUP BY i.code, i.industry`
    );
    return res.json({ industries: result.rows });
  } catch (err) {
    return next(err);
  }
});

// POST /industries - add an industry
router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const result = await db.query(
      "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
      [code, industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// POST /industries/:ind_code/companies/:comp_code - associate industry with company
router.post("/:ind_code/companies/:comp_code", async (req, res, next) => {
  try {
    const { ind_code, comp_code } = req.params;
    const result = await db.query(
      "INSERT INTO company_industries (ind_code, comp_code) VALUES ($1, $2) RETURNING ind_code, comp_code",
      [ind_code, comp_code]
    );
    return res.status(201).json({ company_industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router; 