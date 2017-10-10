/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 *
 * @author rami
 */
@Controller
public class STOMPMessageHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    public static final int POLYGON_THRESHOLD = 3;
    private static final ConcurrentMap<String, Polygon> POLYGON_CONTROLLER = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor(" + numdibujo + "):" + pt);
        msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);

        POLYGON_CONTROLLER.putIfAbsent(numdibujo, new Polygon());
        final Polygon polygon = POLYGON_CONTROLLER.get(numdibujo);

        synchronized (polygon) {
            if (polygon.addPoint(pt)) {
                System.out.println("Nuevo poligono recibido en el servidor(" + numdibujo + "): " + polygon);
                msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
                POLYGON_CONTROLLER.remove(numdibujo);
            }
        }
    }
}
