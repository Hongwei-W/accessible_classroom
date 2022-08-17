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
    'https://script.google.com/macros/s/AKfycbxDT1MqjWpLQZYZQ2BkGdyolBg4pK9F4uvtiKK01D_Xkt3ei_bAPf4gB1LDM2q_xPJY/exec';

const accessible_classroom_message_gsheet =
    'https://script.google.com/macros/s/AKfycbxvDCJramfvguFvoFYj8DYctKjH53kObrSMdf-Fkmodjz8E3dUAnd4Liyj8F_Wwhx6z/exec';

export {postHandler, getHandler, formEncoding, accessible_classroom_general_gsheet, accessible_classroom_message_gsheet};