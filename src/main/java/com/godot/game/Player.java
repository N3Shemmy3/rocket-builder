package com.godot.game;

import godot.annotation.Export;
import godot.annotation.Script;
import godot.api.Node;
import godot.global.GD;

@Script
public class Player extends Node {
    @Export
    public String language = "Java";

    @Override
    public void _ready() {
        GD.print("Hello from " + language);
    }
}