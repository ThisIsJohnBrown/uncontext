using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class CMain : MonoBehaviour {

	SocketIOClient.Client socket;
	// https://github.com/kaistseo/UnitySocketIO-WebSocketSharp

	void Start () {
		socket = new SocketIOClient.Client("http://literature.uncontext.com:80/");

		socket.On("0", (data) => {
			Debug.Log (data.Json.ToJsonString());
		});
		socket.Error += (sender, e) => {
			Debug.Log ("socket Error: " + e.Message.ToString ());
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