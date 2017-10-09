/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


event_listener = (function () {
    return {
        init: function () {
            var canvas = $("#canvas").get(0);

            var handler = function (event) {
                var offset = {"x": $("#canvas").offset().left, "y": $("#canvas").offset().top};
                app.publishPoint(event.pageX - offset.x, event.pageY - offset.y);
            };

            console.info('initialized');
            if (window.PointerEvent) {
                canvas.addEventListener("pointerdown", handler);
            } else {
                canvas.addEventListener("mousedown", handler);
            }
        }
    };
})();