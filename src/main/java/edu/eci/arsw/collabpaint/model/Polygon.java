/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint.model;

import edu.eci.arsw.collabpaint.STOMPMessageHandler;
import java.util.Arrays;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 *
 * @author rami
 */
public class Polygon {

    private final ConcurrentLinkedQueue<Point> points = new ConcurrentLinkedQueue<>();

    public boolean addPoint(Point point) {
        if (!ready()) {
            points.add(point);
        }
        return ready();
    }

    private boolean ready() {
        return points.size() == STOMPMessageHandler.POLYGON_THRESHOLD;
    }

    public void setPoints() {

    }

    public Object[] getPoints() {
        return (Object[]) points.toArray();
    }

    @Override
    public String toString() {
        return "Polygon{"
                + "points:"
                + Arrays.toString(getPoints())
                + "}";
    }
}
