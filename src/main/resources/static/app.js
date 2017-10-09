var app = (function () {

    var drawing_id;

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
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


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + drawing_id, function (eventbody) {
                var object = JSON.parse(eventbody.body);
                addPointToCanvas(object);
                alert(JSON.stringify(object));
            });
        });

    };

    var publish_point = function (pt) {
        stompClient.send("/topic/newpoint." + drawing_id, {}, JSON.stringify(pt));
    };

    return {

        init: function (id) {
            var can = document.getElementById("canvas");
            drawing_id = id;
            $("#connected_to").text("\tDRAWING ID: " + drawing_id);
            //websocket connection

            connectAndSubscribe();
        },

        publishPoint: function (px, py) {
            let pt = new Point(px, py);
            console.info("publishing point at " + JSON.stringify(pt) + " - Drawing id: " + drawing_id);
            addPointToCanvas(pt);
            //publicar el evento
            publish_point(pt);
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