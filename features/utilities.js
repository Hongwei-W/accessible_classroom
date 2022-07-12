function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}


function removeElements(admin_elements) {
    for (var i = admin_elements.length - 1; i >= 0; --i) {
        admin_elements[i].remove();
    }
}

let redColors = ["#FFA07A", "#F08080","#FA8072", "#CD5C5C","#B22222", "#8B0000"];
let WPM = {'slow': 100, 'average': 130, 'fast': 160};

export {findGetParameter, removeElements, redColors, WPM};