// from https://stackoverflow.com/a/20319035/15904243

// var Stopwatch = function(elem, options) {
var Stopwatch = function() {

    // var timer = createTimer(),
        // startButton = createButton("start", start),
        // stopButton = createButton("stop", stop),
        // resetButton = createButton("reset", reset),
    var offset,
        clock,
        interval;

    // default options
    // options = options || {};
    // options.delay = options.delay || 1;

    // append elements
    // elem.appendChild(timer);
    // elem.appendChild(startButton);
    // elem.appendChild(stopButton);
    // elem.appendChild(resetButton);

    // initialize
    reset();

    // private functions
    // function createTimer() {
    //     return document.createElement("span");
    // }

    // function createButton(action, handler) {
    //     var a = document.createElement("a");
    //     a.href = "#" + action;
    //     a.innerHTML = action;
    //     a.addEventListener("click", function(event) {
    //         handler();
    //         event.preventDefault();
    //     });
    //     return a;
    // }

    function start() {
        offset = Date.now();
        // if (!interval) {
        //     offset = Date.now();
        //     interval = setInterval(update, options.delay);
        // }
    }

    // function stop() {
    //     if (interval) {
    //         clearInterval(interval);
    //         interval = null;
    //     }
    // }

    function reset() {
        clock = 0;
        // render(0);
    }

    function update() {
        return clock += delta();
        // render();
    }

    // function render() {
    //     timer.innerHTML = clock / 1000;
    // }

    function delta() {
        var now = Date.now(),
            d = now - offset;

        offset = now;
        return d;
    }

    // public API
    this.start = start;
    // this.stop = stop;
    this.reset = reset;
    this.update = update;
};


export { Stopwatch };