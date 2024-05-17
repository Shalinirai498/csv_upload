const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Function to calculate subscription price
function calculateSubscriptionPrice(creditScore, creditLines, basePrice = 50, pricePerCreditLine = 5, pricePerCreditScorePoint = 1) {
    const subscriptionPrice = basePrice + (pricePerCreditLine * creditLines) + (pricePerCreditScorePoint * creditScore);
    return subscriptionPrice;
}

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                fs.unlinkSync(req.file.path); // Delete the temporary file
                res.json({ success: true, data: results });
            });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Subscription price calculator route
app.post('/calculate-price', express.json(), (req, res) => {
    try {
        const { creditScore, creditLines } = req.body;
        const subscriptionPrice = calculateSubscriptionPrice(parseInt(creditScore), parseInt(creditLines));
        res.json({ subscriptionPrice });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve static files from the public directory
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
