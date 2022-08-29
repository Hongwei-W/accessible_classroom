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
let volumeSoft = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35];
let volumeLoud = [0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65]
let volumeWidthSoft = [5, 10, 15, 20, 25, 30, 35];
let volumeWidthMid = [54, 54, 54, 54, 54, 54, 54];
let volumeWidthLoud = [35, 30, 25, 20, 15, 10, 5];
let volumeSoftDot = {0.16: "20.5%", 0.18: "22.5%", 0.2: "24%", 0.22: "25.5%", 0.24: "27.5%", 0.26: "29.5%", 0.28: "31.5%", 0.3: "33%"};

let speechRateRange = {"slow": 80, "fast": 140};
let rateSlow = [76, 78, 80, 82, 84, 86, 88, 90];
let rateRange = {"slow": 80, "fast": 140};
let rateMin = 60;
let rateMax = 160;

export {findGetParameter, removeElements, redColors, greenColors, themeGreen, opacity, WPM, volumeRange, speechRateRange, volumeSoft, volumeWidthSoft, volumeWidthMid, volumeWidthLoud, volumeSoftDot, volumeWidth, rateSlow, rateRange, rateMax, rateMin, volumeLoud};