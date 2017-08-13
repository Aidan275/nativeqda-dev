$(function () {
	// Code to change CSS variables if we want to implement themes later on.
	//document.documentElement.style.setProperty(`--main-colour`, '#555');

	/* For the file upload modal */
	/* Changes the styling if a file is being dragged onto the file upload drag and drop zone */
	$('#upload-btn-file-browser').click(function() {	/* fired when the upload button is pressed on the file browser page */
		$(function () {	/* when the page is ready find the file-input element */
			var fileInput = $("#file-input");

			fileInput.on('dragenter', function (e) {
				console.log("ASD");
				$(".file-area .file-dummy").css({
					"background": "#edf5ff",
					"border-color": "#4676fa"
				});
				$(".file-area .file-dummy .default").css({
					"color": "#4676fa"
				});
			}).on('dragleave dragend drop', function (e) {
				$(".file-area .file-dummy").css({
					"background": "none",
					"border-color": "#333"
				});
				$(".file-area .file-dummy .default").css({
					"color": "#333"
				});
			});
		});
	});
});

