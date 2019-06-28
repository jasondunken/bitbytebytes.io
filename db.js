

function submit_query() {
    const id = document.getElementById('id');
    const login = document.getElementById('login');
    const password = document.getElementById('password');
    const email = document.getElementById('email');
    const first_name = document.getElementById('first-name');
    const last_name = document.getElementById('last-name');

    postData('//localhost:3000', {answer: 42})
        .then(data => console.log(JSON.stringify(data))) // JSON-string from `response.json()` call
        .catch(error => console.error(error));

    function postData(url = ``, data = {}) {
        // Default options are marked with *
        return fetch(url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "no-cors", // no-cors, cors, *same-origin
            //cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            //credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            //redirect: "follow", // manual, *follow, error
            //referrer: "no-referrer", // no-referrer, *client
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        })
            //.then(response => response.json()); // parses JSON response into native Javascript objects
            //.then(response => console.log(response));

    }
}