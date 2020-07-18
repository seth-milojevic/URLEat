"use strict";

// Require needed modules
var express = require('express');

var cors = require('cors');

var morgan = require('morgan');

var helmet = require('helmet');

var yup = require('yup');

var monk = require('monk');

var _require = require('nanoid'),
    nanoid = _require.nanoid;

require('dotenv').config(); // Setup database


var db = monk(process.env.MONGO_URI);
var urls = db.get('urls');
urls.createIndex({
  slug: 1
}, {
  unique: true
}); // Initiate modules

var app = express();
app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express["static"]('./public')); // Redirect to specified slug's URL

app.get('/:id', function _callee(req, res) {
  var slug, url;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          slug = req.params.id;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(urls.findOne({
            slug: slug
          }));

        case 4:
          url = _context.sent;

          if (url) {
            res.redirect(301, url.url);
          }

          res.redirect("/?error=".concat(slug, " not found"));
          _context.next = 12;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](1);
          res.redirect('/?error=$Link not found');

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 9]]);
}); // Set requirements for user's input

var schema = yup.object().shape({
  slug: yup.string().trim().matches(/\b[\w\-]{1,5}$\b|^$/i),
  url: yup.string().trim().url().required()
}); // Deal with retrieved URL input and slug input from user

app.post('/url', function _callee2(req, res, next) {
  var _req$body, slug, url, newUrl, created;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, slug = _req$body.slug, url = _req$body.url; // If http not specified, set default to https

          if (!url.startsWith("https://") && !url.startsWith("http://")) {
            url = "https://" + url;
          } // Validate the slug and url


          _context2.prev = 2;
          _context2.next = 5;
          return regeneratorRuntime.awrap(schema.validate({
            slug: slug,
            url: url
          }));

        case 5:
          // If no slug is specified, generate a random one
          if (!slug) {
            slug = nanoid(5);
          }

          slug = slug.toLowerCase();
          newUrl = {
            url: url,
            slug: slug
          }; // Insert the desired shortened URL into the database

          _context2.next = 10;
          return regeneratorRuntime.awrap(urls.insert(newUrl));

        case 10:
          created = _context2.sent;
          res.json({
            created: created,
            slug: slug
          });
          _context2.next = 18;
          break;

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](2);

          // Send error SLUG IN USE
          if (_context2.t0.message.startsWith('E11000')) {
            _context2.t0.message = 'sin';
          } // Send error SLUG TOO LONG
          else if (_context2.t0.message.startsWith("slug must match")) {
              _context2.t0.message = 'toolong';
            }

          next(_context2.t0);

        case 18:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[2, 14]]);
});
app.use(function (error, req, res, next) {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }

  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? 'pancake-stack' : error.stack
  });
});
var port = process.env.PORT || 1337;
app.listen(port, function () {
  console.log("Listening at http://localhost:".concat(port));
});