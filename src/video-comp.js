   AFRAME.registerComponent("video",{
      schema:{
          src: {type:"string"},
          volume:{type:"number", default: 0.5},
          loop:{type:"boolean",deafualt:false},
          positional:{type:"boolean",default:true},
          distanceModel:{type:"string",default:"inverse"},
          rolloffFactor:{type:"number",default:1},
          refDistance:{type:"number",default:1},
          maxDistance:{type:"number",default:10000},
          coneInnerAngle: { type: "number", default: 360 },
          coneOuterAngle: { type: "number", default: 0 },
          coneOuterGain: { type: "number", default: 0 },
          play:{type:"boolean",default:false},
          mute:{type:"boolean",default:false},
      },
      init()
      {
        
        //Adding Meta Tag for video component for mobile playback
        let metaTag = document.createElement("meta");
        metaTag.name = "apple-mobile-web-app-capable"
        metaTag.content = "yes";
        document.querySelector("head").appendChild(metaTag);

        //Creating an Audio Listener for  Spatial Audio
        const sceneEl = this.el.sceneEl;
        sceneEl.audioListener = sceneEl.audioListener || new THREE.AudioListener();
        
        // Add audioListener to the camera
        if(sceneEl.camera)
          {
            sceneEl.camera.add(sceneEl.audioListener);
          }
        
        // Event listener to adopt the active camera for audio playback. 
        sceneEl.addEventListener("camera-set-active", function (evt){
          evt.detail.cameraEl.getObject3D("camera").add(sceneEl.audioListener);
        });
      
      },

      update(oldData)
      {
        let updateSrc;
        let updateFlag = false;
        // If there is a change in the source then updateSrc
        if(this.data.src && this.data.src != oldData.src) 
          {
            updateFlag = true;
        
          }
        // If positional Audio is toggled
        if(this.data.positional != oldData.positional)
          {
            updateFlag = true;
        
          }
        
        (async () => {
          if(updateFlag == true)
            { 
              await this.updateSrc();
              updateFlag = false;
            }
          
          //Video controls
          if(this.video)
            {
              if(this.data.play == true)
                {
                  
                  this.video.play();
                  this.el.emit("playback_started")
                }
              else
                {
                  this.video.pause();
                  this.el.emit("playback_stopped")
                }

              this.video.muted = this.data.mute;
              this.audio.gain.gain.value = this.data.volume;
              this.video.loop = this.data.loop;
    

          }
        })();
        
        
      

      },
      async updateSrc()
      {
        
        
        // Extracting the object src from this.data and assigning it to const src
        // It is similar as const src = this.data.src; 
        const  src   = this.data.src;
        
        //Cleaning up any previous texture or video to the component;
        this.cleanup();

        // Removing any instance of material map and setting flag needUpdate to true if in case it is false
        if(this.mesh && this.mesh.material )
          {
            this.mesh.material.map = null;
            this.mesh.material.needsUpdate = true;
          }
        
        //--------------------------------
        
        // texture creation
        let texture;
        try
          {
            texture = await this.createVideoTexture(src);
            
            //Some precaution. 
            //Just in case while this promise is being completed, the src changes, then simply dispose the texture. 
           
            if(this.data.src !== src)
              {
                this.cleanup();
                return;
              }
            
            
            // Setup audio and add it to the audioListener
            this.audioSetup(texture);
            this.video = texture.image;
            this.video.loop = this.data.loop;
    
            
          }catch(e)
            {
              console.error("Error loading video", this.data.src, e);
              
              // TO-DO set some error texture in case anything goes wrong
            }
        
        
        if(!this.mesh)
          {
            this.planeGeometry();    
          }

        // Somehow 
        
        let vertexShader = [
                                    'varying vec2 vUv;',
                                    'void main(void)',
                                    '{',
                                    'vUv = uv;',
                                    'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
                                    'gl_Position = projectionMatrix * mvPosition;',
                                    '}'
                                ].join('\n');
        // Set fragment shader for flat or colorKey Shader
        
            
            let fragemntShader = [
                                      'uniform sampler2D texture;',
                                      'varying vec2 vUv;',
                                      'void main(void)',
                                      '{',
                                      'vec3 tColor = texture2D( texture, vUv ).rgb;',
                                      'gl_FragColor = vec4(tColor, 1);',
                                      '}'
                                  ].join('\n');
            
              this.mesh.material.dispose();
              this.mesh.material = new THREE.ShaderMaterial({
              uniforms:{ texture:{value:texture}},
              vertexShader:vertexShader,
              fragmentShader:fragemntShader,
            });
        
            this.mesh.material.needsUpdate = true;
            this.mesh.material.transparent = false;
          
     
        // Scale the video to appropriate video texture 
        let ratio = texture.image.videoHeight/texture.image.videoWidth;
        this.mesh.scale.set(1,1*ratio,1);
      },
      audioSetup(texture)
      {
        // Spatialized audio component
        // If this component has audio then remove the gameobject "sound" and remove the audioSource.
            if(this.el.getObject3D("sound"))
              {
                this.el.removeObject3D("sound");
                texture.audioSource = null;
              }
            // Add audioSource to the video element. Audio souce is from the sceneEl.audioListener.context 
            texture.audioSource = this.el.sceneEl.audioListener.context.createMediaElementSource(texture.image);
            if(this.data.positional == true)
              {
                this.audio = new THREE.PositionalAudio(this.el.sceneEl.audioListener);
                this.audio.setDistanceModel(this.data.distanceModel);
                this.audio.setRolloffFactor(this.data.rolloffFactor);
                this.audio.setRefDistance(this.data.refDistance);
                this.audio.setMaxDistance(this.data.maxDistance);
                this.audio.panner.coneInnerAngle = this.data.coneInnerAngle;
                this.audio.panner.coneOuterAngle = this.data.coneOuterAngle;
                this.audio.panner.coneOuterGain = this.data.coneOuterGain;
              }
            else
              {
                this.audio = new THREE.Audio(this.el.sceneEl.audioListener);
              }
            
            this.audio.setNodeSource(texture.audioSource);
            this.el.setObject3D("sound",this.audio);
        
      },
      cleanup()
      {
        
        if(this.mesh && this.mesh.material){
          // remove texture
          const texture = this.mesh.material.uniforms.texture.value;
          if(texture.image instanceof HTMLVideoElement)
          {
            const video = texture.image;
          video.pause();
          }
          
          // Remove mesh from the scene
          this.el.removeObject3D("mesh");
          // dispose mesh geometry and material - clear out buffer
          this.mesh.geometry.dispose();
          this.mesh.material.dispose();
          this.mesh = null;
          texture.dispose();
        }
        
        
        
      },
      planeGeometry()
      {
        let geometry = new THREE.PlaneBufferGeometry( );
        let material = new THREE.MeshBasicMaterial( {side:2});
        
        
        this.mesh = new THREE.Mesh( geometry, material );
        this.el.setObject3D("mesh", this.mesh );    
      },
      createVideoTexture(url)
      {
        return new Promise(async (resolve,reject) => {
        
          // Create a videoEl - using await to wait for the code to laod everything
          const videoEl = await this.createVideoEl();
          
          // Create ThreeJS Video texture
          const texture = new THREE.VideoTexture(videoEl);
          texture.minFilter = THREE.LinearFilter;
          texture.encoding = THREE.sRGBEncoding;
          
          
          // TO-DO : Better way to attach url. Best way for MPEG-DASH and also for Live Streaming. 
          videoEl.src = url;
          videoEl.onerror = reject;
          
          let hasResolved = false;
          
          const resolveOnce = () => {
            if(hasResolved) return;
            hasResolved = true;
            this.el.emit("video-canplay");
            resolve(texture);
          };
          
          videoEl.addEventListener("canplay",resolveOnce,{once:true});
          videoEl.addEventListener("loadedmetadata", resolveOnce, {once:true});
          
        });
      },
      async  createVideoEl()
      {
        // Create video element in document
        const videoEl = document.createElement("video");

        // Set necessary attribtues for the playback on various platforms.
        videoEl.setAttribute("playsinline","");
        videoEl.setAttribute("webkit-playsinline","");
        videoEl.autoplay = false;
        // keep it muted for the autoplay if required. 
        videoEl.muted = true;
        videoEl.preload = "auto";
        videoEl.crossOrigin = "anonymous";
        return videoEl;
      },
    remove: function ()
    {
      this.cleanup(); 
    }
      
  });