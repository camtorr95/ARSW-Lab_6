var app = (function () {

    var drawing_id;

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    class Polygon {
        constructor(points) {
            this.points = points;
        }
    }

    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var drawPoligonToCanvas = function (polygon) {
        ctx = document.getElementById("canvas").getContext("2d");
        ctx.beginPath();
        let point = polygon[0];
        ctx.moveTo(point.x, point.y);
        for (i = 1; i < polygon.length; ++i) {
            point = polygon[i];
            ctx.lineTo(point.x, point.y);
        }
        point = polygon[0];
        ctx.lineTo(point.x, point.y);
        ctx.closePath();
        ctx.fillStyle = "grey";
        ctx.fill();
    };

    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var handler = function (event) {
        let position = getMousePosition(event);
        app.publishPoint(position.x, position.y);
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + drawing_id, function (eventbody) {
                let object = JSON.parse(eventbody.body);
                addPointToCanvas(object);
//                alert(JSON.stringify(object));
            });
            stompClient.subscribe('/topic/newpolygon.' + drawing_id, function (eventbody) {
                let polygon = JSON.parse(eventbody.body);
                let points = polygon.points;
                drawPoligonToCanvas(points);
            });
        });
    };

    var publish_point = function (pt) {
        stompClient.send("/app/newpoint." + drawing_id, {}, JSON.stringify(pt));
    };

    return {

        init: function (id) {
            canvas = document.getElementById("canvas");
            drawing_id = id;
            $("#connected_to").text("\tDRAWING ID: " + drawing_id);
            //websocket connection

            connectAndSubscribe();

            //eventListener
            if (window.PointerEvent) {
                canvas.addEventListener("pointerdown", handler);
            } else {
                canvas.addEventListener("mousedown", handler);
            }
        },

        publishPoint: function (px, py) {
            let pt = new Point(px, py);
            console.info("publishing point at " + JSON.stringify(pt) + " - Drawing id: " + drawing_id);
            if (typeof (drawing_id) !== "undefined") {
                addPointToCanvas(pt);
                //publicar el evento
                publish_point(pt);
            } else {
                console.info("Connection is not established");
            }
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };
})();