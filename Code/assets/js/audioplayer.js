$(function () {
	
	// Stop if HTML5 isn't supported
	if (!document.createElement('audio').canPlayType) {
		$("#AudioControls").hide();
		return;
	}
	
	var audio = document.getElementById("MyAudio");
	var volumeBar = document.getElementById("volume-bar");
	var eventArray = [];
	
	// Play Progress =================================//
	$(audio).bind("timeupdate", function () {
		var timePercent = (this.currentTime / this.duration) * 100;
		$("#PlayProgress").css({ width: timePercent + "%" });
	});
	
	// Load Progress =================================//
	$(audio).bind("loadeddata", function () {
		updateLoadProgress();
		audioIsFullyLoaded();
	});
	$(audio).bind("progress", function () {
		updateLoadProgress();
		audioIsFullyLoaded();
	});
	$(audio).bind("canplaythrough", function () {
		updateLoadProgress();
		audioCanPlay();
	});
	$(audio).bind("playing", function () {
		updateLoadProgress();
	});

	var previousTime;
	$(audio).bind("timeupdate", function () {
		// Time Display ===============================//
		$("#CurrentTime").html(formatTime(this.currentTime));

		// Call checkForEvent only once per second
		var myCurrentTime = Math.floor(this.currentTime);
		if (myCurrentTime == previousTime) {
			//ignore
		} else {
			// Turn currentTime into index for use in array and call checkForEvent function
			var timeAsIndex = Math.floor(this.currentTime);
			checkForEvent(timeAsIndex);
			previousTime = myCurrentTime;
		}
	});

	$(audio).bind("durationchange", function () {
		$("#Duration").html(formatTime(this.duration));
	});

	// Detect End of Audio ============================//
	$(audio).bind("ended", function () {
		console.log("End of audio has been detected.");
	});

	// Event listener for the volume bar
	volumeBar.addEventListener("change", function () {
		// Update the audio volume
		// Note: range MUST BE between 0 and 1, hence the division by 100
		audio.volume = volumeBar.value / 100;
	});

	function updateLoadProgress() {
		if (audio.buffered.length > 0) {
			var percent = (audio.buffered.end(0) / audio.duration) * 100;
			$("#LoadProgress").css({ width: percent + "%"});
			$("#LoadProgressText").html(Math.round(percent) + "%");
		}
	}

	// Time Format ==================================//
	function formatTime(seconds) {
		var seconds = Math.round(seconds);
		var minutes = Math.floor(seconds / 60);
		// Remaining seconds
		seconds = Math.floor(seconds % 60);
		// Add leading zeros
		minutes = (minutes >= 10) ? minutes : "0" + minutes;
		seconds = (seconds >= 10) ? seconds : "0" + seconds;
		return minutes + ":" + seconds;
	}

	// Detect Audio is Fully Loaded ==================//
	function audioIsFullyLoaded() {
		if (Math.round(audio.buffered.end(0)) == Math.round(audio.duration)) {
			console.log("Audio is fully loaded");
			// Wait until audio is fully loaded before defining array length
			defineArray();
		}
	}

	// Detects when enough audio has loaded to insure play through the end of the file
	function audioCanPlay() {
		console.log("Audio has buffered enough to play to the end uninterrupted");
	}

	// Set Current Time ===============================//
	function setCurrentTime(selectedAudioLocation) {
		audio.currentTime = selectedAudioLocation;
		$("#LoadProgressText").hide();
	}

	function defineArray() {
		// make array length of audio file and insert undefined as value so you can iterate over it
		var len = Math.floor(audio.duration);
		eventArray = Object.create(Array.prototype, { length: { value: len + 1 } });
	}

	function checkForEvent(currentTime) {
		// If event at current time location has content in it, show it
		if (typeof eventArray[currentTime] !== 'undefined') {
			$("#ReceivedData").html("An event was detected at: <strong> " + currentTime + "</strong> and is: <strong> " + eventArray[currentTime] + "</strong>");
			console.log(eventArray[currentTime] + " playing back at time: " + currentTime);
			console.log(eventArray);
		}
	}

	// Play Pause Toggle ==============================//
	$("#PlayToggle").bind("click", function () {
		if (audio.paused) {
			audio.play();
			$(this).html("Pause");
			$("#LoadProgressText").hide();
		} else {
			audio.pause();
			$(this).html("Play");
			$("#LoadProgressText").hide();
		}
	});

	$("#RewindButton").on('click', function () {
		setCurrentTime(0);
	});

	$("#SetTimeButton").on('click', function () {
		setCurrentTime(30);
	});

	$("#Progress").click(function(e) {
		// get x location of click
		var x = e.pageX - this.offsetLeft;
		// console.log("x is: " + x);

		// get width of progress area
		var progressWidth = $("#Progress").width();
		// console.log("progressWidth is: " + progressWidth);

		// calc as percentage
		var clickedPercent = x / progressWidth;
		// console.log("clickedPercent is: " + clickedPercent);

		// calc as audio location
		var audioLocation = (Math.round(audio.buffered.end(0)) * clickedPercent);
		// console.log("audioLocation is: " + audioLocation);

		// set audio location to currently clicked time location
		setCurrentTime(audioLocation);
	});

	$("#EnterEventButton").on('click', function () {
		var clickTime = Math.floor(audio.currentTime);
		var clickText = $("#inputField").val();

		eventArray[clickTime] = clickText;
		console.log("Event: " + clickText + " has been added at time: " + clickTime);
	});

});