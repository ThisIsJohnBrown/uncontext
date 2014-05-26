import java.net.URI;
import java.net.URISyntaxException;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_17;
import org.java_websocket.handshake.ServerHandshake;

private WebSocketClient cc;

void setup(){
  try {
    cc = new WebSocketClient( new URI( "ws://literature.uncontext.com:80" ), new Draft_17() ) {

      @Override
      public void onMessage( String message ) {
        try {
          JSONObject data = JSONObject.parse(message);
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
}
