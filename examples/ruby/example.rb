require 'websocket-eventmachine-client'
require 'json'

EM.epoll
EM.run do

  ws = WebSocket::EventMachine::Client.connect(:uri => 'ws://literature.uncontext.com:80')

  ws.onopen do
    puts "Connected to uncontext."
  end

  ws.onmessage do |msg, type|
    puts JSON.parse(msg)
  end

  ws.onclose do
    puts "Disconnected from uncontext."
  end

  ws.onerror do |error|
    puts "Error: #{error}"
  end

end