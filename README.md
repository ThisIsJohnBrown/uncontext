# Uncontext
***

## Very much in beta! Updates coming soon.
#### May 24th, 2013: Switched to ws:// protocol, so update your code if you have any.

***

#### What's it all about?
Uncontext provides the world with a socket that is streaming data in a structured format, 24/7. Built with node.js and socket.io, almost anything can be connected to uncontext: websites, Arduino, Cinder, Unity, iOS, and Android are just the beginning.

Everyone is invited to connect with their platform of choice, consume that data, and create something with it. Just a few examples include:

* Program interactive visuals
* Write a series of sonnets
* Control robotic arms
* Compose a symphomic movement
* 3D print physical representations

Each socket will have a theme surrounding the data, but the true nature of the bits will remain a mystery until the next socket is released.

***

#### What's the current theme?

## Literature
### ws://literature.uncontext.com:80

The data is in the format:

```
{
  {"name": "0": {
  	"a": int (0-25),
  	"b": float (1-20.33, to two decimal places),
  	"c": int (0 or 1),
  	"d": int (1-14),
  	"e": {
  		"f": int (less than g),
  		"g": int (1-467)
  	}
}
```
***

#### How do I get started?

There's no registration, all you need to do is connect to the current stream (ws://literature.uncontext.com:80). You don't even need to clone or download this repo. If you need a bit of a head start, though, check out the examples folder for code examples, including:

* [Node](https://github.com/ThisIsJohnBrown/uncontext/tree/master/examples/node)
* [Processing](https://github.com/ThisIsJohnBrown/uncontext/tree/master/examples/processing)
* [Ruby](https://github.com/ThisIsJohnBrown/uncontext/tree/master/examples/ruby)
* [Unity](https://github.com/ThisIsJohnBrown/uncontext/tree/master/examples/unity)
* [Python](https://github.com/ThisIsJohnBrown/uncontext/tree/master/examples/python)

You could also go through the submissions from other uncontexters and see what they're doing.

***

#### What do I submit?

Firstly, if you read through this and aren't comfortable with git, [send me an email](mailto:thisisjohnbrown@gmail.com) and we'll get your project up on the website.

If you know git magic, fork this repo and let's create a new scene, which we'll call __Rain Water__.

In `/scenes/literature`, create a new file `rainwater.json` (it goes in `/literature` because that's the only theme right now).

For information about the scene, the file should look like this:

```
{
  "creator": "George Pickles",
  "name": "Rain Water",
  "slug": "rain-water", //  (optional, otherwise auto generated)
  "description": "Lorem ipsum" // 140 character description 
  "twitter": "georgepickles" // twitter handle (optional),
  "url": "http://georgepickles.com", // your website or blog (optional)
}
```

If your project is meant to be viewed in the browser, read [1]. If it is prerendered or physical or some other adjective that doesn't lend itself to viewing in a browser, skip to [2].

[1]

I assume you have some assets you created. For our Rain Water example, your javascript and css files should be named `rainwater.js` and `rainwater.css` and be put in `/public/js/literature` and `/public/css/literature`. These will be automatically pulled in.

If you have some third party frameworks you need, know that jQuery and Bootstrap will be available to you.

The following can also be instantiated on the page for you to use by adding thise to your `rainwater.json` file:

```
"assets": {
  "threejs": true, // Three.js r67
  "processingjs": true, // Processing.js 1.4.8
  "d3": true, // D3 3.4.6
  "raphaeljs": true, // Raphael.js 2.1.2
  "toxiclibsjs": true, // Toxiclibs.js 0.2.7
  "kineticjs": true, // Kinetic.js 5.1.0
}
```

[2]

Never fear! Upload a video to Vimeo or Youtube, and then add the id to your scene file:

```
...
"vimeo": "498739874"
or 
"youtube": "234dj2ij3l-"
...
```
