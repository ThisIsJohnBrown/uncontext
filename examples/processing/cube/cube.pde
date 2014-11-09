import java.net.URI;
import java.net.URISyntaxException;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_17;
import org.java_websocket.handshake.ServerHandshake;

// Download java_websocket from https://github.com/TooTallNate/Java-WebSocket/tree/master/dist
// and place into your libraries folder for Processing
// http://wiki.processing.org/w/How_to_Install_a_Contributed_Library

private WebSocketClient cc;
JSONObject data = new JSONObject();
  float a1 = 1;
  float a2 = 1;
  float b1 = 1;
  float b2 = 1;
  int c = 1;
  float d = 1;
  float e = 1;
  float f = 1;
  int rotateColor = 0;
  float size = 260;
  int sizedelta = 1;
  
void setup(){


  try {
    cc = new WebSocketClient( new URI( "ws://duel.uncontext.com:80" ), new Draft_17() ) {

      @Override
      public void onMessage( String message ) {
        try {
          data = JSONObject.parse(message);
          println(data);
        } catch (Exception e) {
          println(e);
        }
      }

      @Override
      public void onOpen( ServerHandshake handshake ) {
        println( "You are connected to uncontext." );
      }

      @Override
      public void onClose( int code, String reason, boolean remote ) {
        println( "You have been disconnected from uncontext.: Code: " + code + " " + reason);
      }

      @Override
      public void onError( Exception ex ) {
        println(ex);
      }
    };
    cc.connect();
  } catch ( URISyntaxException ex ) {
    // required
  }
  size(800,600,P3D);
  background(0);
  lights();
}
void draw(){
  rotateColor = (rotateColor + 1) % 360;
  try {
    a1 = data.getJSONArray("a").getFloat(0);
    a2 = data.getJSONArray("a").getFloat(1);
    b1 = data.getJSONArray("b").getFloat(0);
    b2 = data.getJSONArray("b").getFloat(1);
    c = data.getInt("c");
    d = data.getFloat("d");
    e = data.getFloat("e");
    f = data.getFloat("f");
  } catch (Exception error) {
  }
  if(c == 1){
    size += (sizedelta * 1.9);
    if(size > 600){
      size -= 300;
    }
  } else {
    size -= sizedelta;
    if(size < 20){
      size += 400;
    }
  }
  pushMatrix();
  rotateZ((2*PI/360)*rotateColor);
  directionalLight(255 * d, 255 * e, 255 * f, -1, -1, -1);
  rotateZ(2*PI/3);
  directionalLight(255 * f, 255 * d, 255 * e, -1, -1, -1);
  rotateZ(2*PI/3);
  directionalLight(255 * e, 255 * f, 255 * d, -1, -1, -1);
  popMatrix();
  //directionalLight(255, 0, 0, -1, 0, 0);
  //directionalLight(0, 0, 255, 0, 0, -1);
  float fov = PI/3;
  float cameraZ = (height/2.0) / tan(fov/2.0);
  perspective(fov, float(width)/float(height), cameraZ/10.0, cameraZ*10.0);
  translate(width/2, height/2, 0);
  pushMatrix();
  translate(width * b1 - width/2,height * b2 - height/2,0);
  rotateX((-PI/1)* a1);
  rotateY((PI/1)* a2);
  noStroke();
  box(size);
  popMatrix();
}
