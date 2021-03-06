function postHandler(url, formBody) {
    return fetch (url, {
        body: formBody,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        method: 'POST'
    }).then(response => response.json())
}


function getHandler(url) {
    return fetch (url, {
        method: 'GET'
    }).then(response => response.json())
}


function formEncoding(details) {
    let formBody = [];

    for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }

    formBody = formBody.join("&");
    return formBody;
}

const accessible_classroom_general_gsheet =
    'https://script.google.com/macros/s/AKfycbyem4JJXEQsGyjOQVKARLvcRw_0RH9sYiEjJ0O0Xi8h71jQdsAq-nNm8VZG4VZpXiRE/exec';

const accessible_classroom_message_gsheet =
    'https://script.google.com/macros/s/AKfycbwoCR3wKZlhQbNN24unWFyAxcOSW_zDXkA4AEVzcccJLDIXFO9KhsjY_p5Xyr7WU2s/exec';

export {postHandler, getHandler, formEncoding, accessible_classroom_general_gsheet, accessible_classroom_message_gsheet};