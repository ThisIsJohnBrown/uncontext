# sudo pip install websocket-client
# https://pypi.python.org/pypi/websocket-client/

import websocket

def on_message(ws, message):
    print message

def on_error(ws, error):
    print error

def on_close(ws):
    print "Connection Closed"

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://literature.uncontext.com",
                                on_message = on_message,
                                on_error = on_error,
                                on_close = on_close)

    ws.run_forever()