# A-Frame Video Component
Video component with spatial audio, automatic aspect ratio transform and easy controls for [A-Frame](https://aframe.io) to add it in your scene. 

## Demo
Landscape Video
![Landscape](Static/horizontal.png) 
Portrait Video
![Portrait](Static/portrait.png)


## Getting Started

```html
<a-entity id = "videoEntity" video="src:  Assets/smallTalk.mp4;  volume:  1; distanceModel: inverse; positional: true; volume : 0.8"></entity>
```

To play or pause via code: 
```javascript
document.querySelector("#videoEntity").setAttribute("video", "play", true);
```

Properties:
## Properties

| Property      | Description                                                                                                    | Default Value |
|---------------|----------------------------------------------------------------------------------------------------------------|---------------|
| distanceModel | `linear`, `inverse`, or `exponential`                                                                          | inverse        |
| loop          | Whether to loop the video once it finishes playing.                                                     | false         |
| maxDistance   | Maximum distance between the video and the listener, after which the volume is not reduced any further. | 10000         |
| positional    | Whether or not the video's audio is spatial or not.                                                               | true          |
| refDistance   | Reference distance for reducing volume as the audio source moves further from the listener.                    | 1             |
| rolloffFactor | Describes how quickly the volume is reduced as the source moves away from the listener.                        | 1             |
| src           | String passing the video source url                                        | null          |
| volume        | How loud to play the sound.                                                                                    | 0.5             |
|play | Toggle for playing or pausing the video | false|
|mute | Toggle for muting or unmuting the video  | false|




## Want to make some changes to it?

### Installation

First make sure you have Node installed.

On Mac OS X, it's recommended to use [Homebrew](http://brew.sh/) to install Node + [npm](https://www.npmjs.com):

    brew install node

To install the Node dependencies:

    npm install


### Local Development

To serve the site from a simple Node development server:

    npm start

Then launch the site from your favourite browser:

[__http://localhost:3002/__](http://localhost:3002/)

If you wish to serve the site from a different port:

    PORT=8000 npm start


## Change log





## License

Distributed under an [MIT License](LICENSE).

