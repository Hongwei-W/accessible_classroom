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
let greenColors = ['#4F7942', '#008000', '#228B22'];
let themeGreen = "#29CC97";
let opacity = ["CC", "99", "66"]
let WPM = {'slow': 100, 'average': 130, 'fast': 160};
let volumeRange = {"soft": 0.2, "loud": 0.8};
let volumeWidth = {"soft": 20, "mid": 54, "loud": 20};
let volumeSoft = [0.16, 0.18, 0.2, 0.22, 0.24, 0.26, 0.28, 0.3];
let volumeWidthSoft = [16, 18, 20, 22, 24, 26, 28, 30];
let volumeWidthMid = [58, 56, 54, 52, 50, 48, 46, 44];
let volumeSoftDot = {0.16: "20.5%", 0.18: "22.5%", 0.2: "24%", 0.22: "25.5%", 0.24: "27.5%", 0.26: "29.5%", 0.28: "31.5%", 0.3: "33%"};

let speechRateRange = {"slow": 80, "fast": 140};
let rateSlow = [76, 78, 80, 82, 84, 86, 88, 90];
let rateRange = {"slow": 80, "fast": 140};

export {findGetParameter, removeElements, redColors, greenColors, themeGreen, opacity, WPM, volumeRange, speechRateRange, volumeSoft, volumeWidthSoft, volumeWidthMid, volumeSoftDot, volumeWidth, rateSlow, rateRange};