// Require needed modules
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const monk = require('monk');
const { nanoid } = require('nanoid');

require('dotenv').config();

// Setup database
const db = monk(process.env.MONGO_URI);
const urls = db.get('urls');
urls.createIndex({ slug: 1 }, { unique: true });

// Initiate modules
const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));

// Redirect to specified slug's URL
app.get('/:id', async (req, res) => {
    const { id: slug } = req.params;
    try {
        const url = await urls.findOne({ slug });
        if (url) {
            res.redirect(301, url.url);
        }
        res.redirect(`/?error=${slug} not found`);
    } catch(error) {
        res.redirect('/?error=$Link not found');
    }
});

// Set requirements for user's input
const schema = yup.object().shape({
    slug: yup.string().trim().matches(/\b[\w\-]{1,5}$\b|^$/i),
    url: yup.string().trim().url().required(),
})

// Deal with retrieved URL input and slug input from user
app.post('/url', async (req, res, next) => {
    let { slug, url } = req.body;
    // If http not specified, set default to https
    if (!(url.startsWith("https://")) && !(url.startsWith("http://")))
    {
        url = "https://" + url;
    }
    // Validate the slug and url
    try {
        await schema.validate({
            slug,
            url,
        });
        // If no slug is specified, generate a random one
        if (!slug) {
            slug = nanoid(5);
        }
        slug = slug.toLowerCase();
        const newUrl = {
            url,
            slug,
        };
        // Insert the desired shortened URL into the database
        const created = await urls.insert(newUrl);
        res.json({created: created, slug: slug});
    } catch (error) {
        // Send error SLUG IN USE
        if (error.message.startsWith('E11000')) {
            error.message = 'sin';
        } 
        // Send error SLUG TOO LONG
        else if (error.message.startsWith("slug must match")) {
            error.message = 'toolong';
        }
        next(error);
    }
});

app.use((error, req, res, next) => {
    if (error.status) {
        res.status(error.status);
    } else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? 'pancake-stack' : error.stack,
    });
});

const port = process.env.PORT || 3337;
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening at http://localhost:${port}`);
});
