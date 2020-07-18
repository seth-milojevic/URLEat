"use strict";

var app = new Vue({
  el: '#app',
  data: {
    url: '',
    slug: '',
    created: null
  },
  methods: {
    createUrl: function createUrl() {
      var response;
      return regeneratorRuntime.async(function createUrl$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(fetch('/url', {
                method: 'POST',
                headers: {
                  'content-type': 'application/json'
                },
                body: JSON.stringify({
                  url: this.url,
                  slug: this.slug
                })
              }));

            case 2:
              response = _context.sent;
              _context.next = 5;
              return regeneratorRuntime.awrap(response.json());

            case 5:
              this.created = _context.sent;

              if (this.created.message == "url must be a valid URL" || this.created.message == "url is a required field") {
                document.getElementById("output").value = "Please enter a valid URL.";
              } else if (this.created.message == "sin") {
                document.getElementById("output").value = "Slug is in use.";
              } else if (this.created.message == "toolong") {
                document.getElementById("output").value = "Slug must be < 5 characters.";
              } else {
                document.getElementById("output").value = "localhost:1337/" + this.created.slug;
              }

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }
});