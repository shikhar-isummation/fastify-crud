const fastify = require('fastify');
const mysql = require('mysql2/promise');

const app = fastify();
const port = 4500;

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'classicmodels'
};
   
// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Route to get all offices
app.get('/offices', async (req, reply) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM offices');
        connection.release();
        reply.send(rows);
    } catch (error) {
        console.error(error);
        reply.status(500).send(`An error occurred \n Error is Below: \n ${error}`);
    }
});

// GET office by officeCode
app.get('/offices/:officeCode', async (req, reply) => {
    const officeCode = req.params.officeCode;
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(`
        SELECT
         *
        FROM
          offices AS o
        RIGHT JOIN
          employees AS e ON o.officeCode = e.officeCode
        WHERE
          o.officeCode = ?;
      `, [officeCode]);
        connection.release();

        if (rows.length === 0) {
            reply.status(404).send({ message: 'Office not found' });
        } else {
            reply.send(rows);
        }
    } catch (error) {
        console.error(error);
        reply.status(500).send(`An error occurred \n Error is Below: \n ${error}`);
    }
});


// Route to create a new office
app.post('/offices', async (req, reply) => {
    const { officeCode, addressLine1, addressLine2, city, country, phone, postalCode, state, territory } = req.body;
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO offices (officeCode, addressLine1, addressLine2, city, country, phone, postalCode, state, territory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [officeCode, addressLine1, addressLine2, city, country, phone, postalCode, state, territory]
        );
        connection.release();
        reply.send({ message: `Office added successfully & OfficeCode is ${officeCode}` });
    } catch (error) {
        console.error(error);
        reply.status(500).send(`An error occurred \n Error is Below: \n ${error}`);
    }
});

// Route to delete an office
app.delete('/offices/:officeCode', async (req, reply) => {
    const officeCode = req.params.officeCode;
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query('DELETE FROM offices WHERE officeCode = ?', [officeCode]);
        connection.release();
        if (result.affectedRows === 0) {
            reply.status(404).send({ message: 'Office not found' });
        } else {
            reply.send({ message: 'Office deleted successfully' });
        }
    } catch (error) {
        console.error(error);
        reply.status(500).send(`An error occurred \n Error is Below: \n ${error}`);
    }
});

// Route to update an office
app.patch('/offices/:officeCode', async (req, reply) => {
    const officeId = req.params.officeCode;
    const { officeCode, addressLine1, addressLine2, city, country, phone, postalCode, state, territory } = req.body;
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'UPDATE offices SET officeCode = ?, addressLine1 = ?, addressLine2 = ?,city = ?, country = ?, phone = ?, postalCode = ?, state = ?, territory = ? WHERE officeCode = ?',
            [officeCode, addressLine1, addressLine2, city, country, phone, postalCode, state, territory, officeId]
        );
        connection.release();
        if (result.affectedRows === 0) {
            reply.status(404).send({ message: 'Office not found' });
        } else {
            reply.send({ message: 'Office updated successfully' });
        }
    } catch (error) {
        console.error(error);
        reply.status(500).send(`An error occurred \n Error is Below: \n ${error}`);
    }
});  
  
// Start the server
app.listen({ port }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Fastify server running on http://localhost:${port}`);
});
