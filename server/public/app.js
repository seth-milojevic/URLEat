const app = new Vue({
    el: '#app',
    data: {
        url: '',
        slug: '',
        created: null,
    },
    methods: {
        async createUrl() {
            const response = await fetch('/url', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    url: this.url,
                    slug: this.slug
                }),
            });
            this.created = await response.json();
            if (this.created.message == "url must be a valid URL" || this.created.message == "url is a required field")
            {
                document.getElementById("output").value = "Please enter a valid URL.";
            } else if (this.created.message == "sin") {
                document.getElementById("output").value = "Slug is in use.";
            } else if (this.created.message == "toolong") {
                document.getElementById("output").value = "Slug must be <= 5 characters.";
            } else {
                document.getElementById("output").value = "https://localhost:3337/" + this.created.slug;
            }
        }
    }
})

function copyURL() {
    /* Get the text field */
    var cText = document.getElementById("output");
    /* Select the text field */
    cText.select();
    cText.setSelectionRange(0, 100); /*For mobile devices*/
    /* Copy the text inside the text field */
    document.execCommand("copy");
  } 
