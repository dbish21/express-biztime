const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET /invoices - list all invoices
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM invoices");
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

// GET /invoices/:id - get details on a single invoice
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with id ${id} not found`, 404);
    }

    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// POST /invoices - add a new invoice
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PUT /invoices/:id - update an invoice
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;
    
    let paidDate = null;
    
    // Get current payment status
    const currResult = await db.query(
      "SELECT paid, paid_date FROM invoices WHERE id = $1",
      [id]
    );
    
    if (currResult.rows.length === 0) {
      throw new ExpressError(`Invoice with id ${id} not found`, 404);
    }

    const currPaidDate = currResult.rows[0].paid_date;

    if (paid && !currResult.rows[0].paid) {
      // Paying unpaid invoice
      paidDate = new Date();
    } else if (!paid) {
      // Unpaying
      paidDate = null;
    } else {
      // Keep current paid_date
      paidDate = currPaidDate;
    }

    const result = await db.query(
      `UPDATE invoices 
       SET amt=$1, paid=$2, paid_date=$3
       WHERE id=$4
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, paid, paidDate, id]
    );

    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router; 