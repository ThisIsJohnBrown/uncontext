using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using WebSocketSharp;

public class CMain : MonoBehaviour {

	WebSocket socket;
	// https://github.com/sta/websocket-sharp
	
	void Start () {
		socket = new WebSocket("ws://literature.uncontext.com:80");
	
		socket.OnError += (sender, e) => {
			Debug.Log ("socket Error: " + e.Message.ToString());
		};
		socket.OnMessage += (sender, e) => {
			Debug.Log ("socket message: " + e.Data);
		};
		
		socket.Connect();
	}

	void OnGUI () {
		
		if (GUI.Button (new Rect (20, 120, 150, 30), "Close Connection")) {
			Debug.Log ("Closing");
			
			socket.Close();
		}
	}
}